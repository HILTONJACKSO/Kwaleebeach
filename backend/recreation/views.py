from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date, timedelta
from django.db.models import Sum, Count
from pms.models import Room, Booking
from finance.models import Invoice, InvoiceItem
import uuid
from .models import AccessPass, PassType, PassReturn, Activity, Package, CSRProject, Event
from .serializers import (
    AccessPassSerializer, PassTypeSerializer, PassReturnSerializer,
    ActivitySerializer, PackageSerializer, CSRProjectSerializer,
    EventSerializer
)

class PassTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PassType.objects.all()
    serializer_class = PassTypeSerializer
    permission_classes = [permissions.AllowAny]

class PassReturnViewSet(viewsets.ModelViewSet):
    queryset = PassReturn.objects.all().order_by('-requested_at')
    serializer_class = PassReturnSerializer

class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.AllowAny]

class PackageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [permissions.AllowAny]

class CSRProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CSRProject.objects.all()
    serializer_class = CSRProjectSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        ret = self.get_object()
        ret.status = 'APPROVED_ADMIN'
        ret.save()
        return Response({'status': 'Approved'})

class AccessPassViewSet(viewsets.ModelViewSet):
    queryset = AccessPass.objects.all()
    serializer_class = AccessPassSerializer

    @action(detail=True, methods=['post'], url_path='request-return')
    def request_return(self, request, pk=None):
        access_pass = self.get_object()
        reason = request.data.get('reason')
        if not reason:
            return Response({'error': 'Reason is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        PassReturn.objects.create(
            access_pass=access_pass,
            reason=reason,
            status='REQUESTED'
        )
        return Response({'status': 'Return requested'})

    @action(detail=False, methods=['get'], url_path='verify-room')
    def verify_room(self, request):
        room_number = request.query_params.get('room')
        if not room_number:
            return Response({'error': 'Room number required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Check for active booking: today is between check_in and check_out
            today = date.today()
            booking = Booking.objects.filter(
                room__room_number=room_number,
                check_in__lte=today,
                check_out__gte=today,
                is_checked_in=True
            ).first()
            
            if booking:
                return Response({
                    'valid': True,
                    'guest_name': booking.guest_name,
                    'message': 'Active resident found. Access granted.'
                })
            else:
                return Response({
                    'valid': False,
                    'message': 'No active checked-in booking found for this room.'
                })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='checkin-resident')
    def checkin_resident(self, request):
        room_number = request.data.get('room_number')
        location = request.data.get('location', 'POOL')
        
        if not room_number:
            return Response({'error': 'Room number required'}, status=status.HTTP_400_BAD_REQUEST)
            
        today = date.today()
        booking = Booking.objects.filter(
            room__room_number=room_number,
            check_in__lte=today,
            check_out__gte=today,
            is_checked_in=True
        ).first()
        
        if not booking:
            return Response({'error': 'No active checked-in booking found.'}, status=status.HTTP_404_NOT_FOUND)
            
        pass_type, _ = PassType.objects.get_or_create(
            name='Resident Access',
            defaults={'price': 0.00, 'location': location}
        )
        
        access_pass = AccessPass.objects.create(
            pass_type=pass_type,
            guest_name=booking.guest_name,
            room=booking.room,
            amount_paid=0.00,
            status='ACTIVE'
        )

        # Residents are free, so no invoice needed here usually. 
        # But if there was a charge, we would add the invoice logic.
        
        return Response(AccessPassSerializer(access_pass).data)

    @action(detail=False, methods=['post'], url_path='sell')
    def sell_pass(self, request):
        pass_type_id = request.data.get('pass_type_id')
        custom_name = request.data.get('custom_name')
        custom_price = request.data.get('custom_price')
        location = request.data.get('location')
        
        if custom_name and custom_price is not None and location:
            # Create or get custom event pass type
            pass_type, _ = PassType.objects.get_or_create(
                name=custom_name,
                location=location,
                defaults={'price': custom_price}
            )
            final_price = float(custom_price)
        else:
            pass_type = PassType.objects.get(id=pass_type_id)
            final_price = float(pass_type.price)
        
        access_pass = AccessPass.objects.create(
            pass_type=pass_type,
            amount_paid=final_price,
            status='ACTIVE'
        )

        # Create Invoice for Cashier
        if final_price > 0:
            try:
                invoice = Invoice.objects.create(
                    invoice_number=f"INV-REC-{uuid.uuid4().hex[:6].upper()}",
                    total_ht=final_price,
                    total_ft=final_price,
                    balance_ptd=final_price,
                    is_paid=False
                )
                InvoiceItem.objects.create(
                    invoice=invoice,
                    description=f"Recreation Pass: {pass_type.name} ({pass_type.location})",
                    quantity=1,
                    unit_price=final_price,
                    total_line=final_price
                )
            except Exception as e:
                print(f"Failed to create recreation invoice: {e}")

        return Response(AccessPassSerializer(access_pass).data)

    @action(detail=False, methods=['get'], url_path='recent')
    def recent(self, request):
        # Return last 10 passes
        recent_passes = AccessPass.objects.all().order_by('-created_at')[:10]
        return Response(AccessPassSerializer(recent_passes, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        now = date.today()
        # Timeframes
        ranges = {
            'today': now,
            'week': now - timedelta(days=7),
            'month': now - timedelta(days=30),
            'year': now - timedelta(days=365)
        }

        data = {}
        for label, start_date in ranges.items():
            # Filter by date range
            qs = AccessPass.objects.filter(created_at__date__gte=start_date)
            
            # Aggregate total revenue & count
            total_revenue = qs.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0.00
            total_passes = qs.count()

            # Split by Location (Pool vs Beach)
            # Note: Residents (price=0) count towards passes but 0 revenue
            pool_qs = qs.filter(pass_type__location='POOL')
            pool_revenue = pool_qs.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0.00
            pool_count = pool_qs.count()

            beach_qs = qs.filter(pass_type__location='BEACH')
            beach_revenue = beach_qs.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0.00
            beach_count = beach_qs.count()

            data[label] = {
                'total_revenue': total_revenue,
                'total_passes': total_passes,
                'pool': {'revenue': pool_revenue, 'passes': pool_count},
                'beach': {'revenue': beach_revenue, 'passes': beach_count}
            }
        
        return Response(data)

    @action(detail=True, methods=['post'], url_path='mark-printed')
    def mark_printed(self, request, pk=None):
        access_pass = self.get_object()
        if access_pass.is_printed:
            return Response({'message': 'Already printed'}, status=status.HTTP_200_OK)
            
        access_pass.is_printed = True
        access_pass.save()
        return Response({'status': 'marked as printed'})
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('date', 'time')
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
