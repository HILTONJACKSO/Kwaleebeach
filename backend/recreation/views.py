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

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        ret = self.get_object()
        ret.status = 'APPROVED_ADMIN'
        ret.save()
        
        # Mark pass as cancelled
        ret.access_pass.status = 'CANCELLED'
        ret.access_pass.save()
        
        return Response({'status': 'Approved'})

    @action(detail=False, methods=['get'])
    def history(self, request):
        days = request.query_params.get('days', None)
        queryset = self.get_queryset().exclude(status='REQUESTED')
        
        if days:
            from django.utils import timezone
            from datetime import timedelta
            start_date = timezone.now() - timedelta(days=int(days))
            queryset = queryset.filter(requested_at__gte=start_date)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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

    pass

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
        location = request.data.get('location') # 'POOL' or 'BEACH'
        adult_count = int(request.data.get('adult_count', 0))
        kids_count = int(request.data.get('kids_count', 0))
        payment_method = request.data.get('payment_method') # Optional: 'CASH', 'MOMO_LONESTAR', etc.
        guest_name = request.data.get('guest_name', 'Walk-in')

        if not location:
            return Response({'error': 'Location is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Find PassTypes
        adult_type = None
        kids_type = None
        
        if adult_count > 0:
            adult_type = PassType.objects.filter(location=location, name__icontains='Adult').first()
            if not adult_type:
                return Response({'error': f'No Adult pass type found for {location}'}, status=status.HTTP_404_NOT_FOUND)
        
        if kids_count > 0:
            kids_type = PassType.objects.filter(location=location, name__icontains='Kids').first()
            if not kids_type:
                return Response({'error': f'No Kids pass type found for {location}'}, status=status.HTTP_404_NOT_FOUND)

        total_price = 0
        pass_items = []

        if adult_count > 0:
            total_price += float(adult_type.price) * adult_count
            pass_items.append({'type': adult_type, 'count': adult_count})
        
        if kids_count > 0:
            total_price += float(kids_type.price) * kids_count
            pass_items.append({'type': kids_type, 'count': kids_count})

        if not pass_items:
            return Response({'error': 'No guests selected'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Access Passes
        created_passes = []
        for item in pass_items:
            for _ in range(item['count']):
                p = AccessPass.objects.create(
                    pass_type=item['type'],
                    amount_paid=item['type'].price,
                    guest_name=guest_name,
                    status='ACTIVE'
                )
                created_passes.append(p)

        # Create Invoice
        invoice = None
        if total_price > 0:
            invoice = Invoice.objects.create(
                invoice_number=f"INV-REC-{uuid.uuid4().hex[:6].upper()}",
                reference_location=f"{location} POS",
                total_ht=total_price,
                total_ft=total_price,
                balance_ptd=total_price,
                is_paid=False
            )
            for item in pass_items:
                InvoiceItem.objects.create(
                    invoice=invoice,
                    description=f"{item['type'].name} x{item['count']}",
                    quantity=item['count'],
                    unit_price=item['type'].price,
                    total_line=float(item['type'].price) * item['count']
                )

            # Handle Payment
            if payment_method:
                from finance.models import Payment
                Payment.objects.create(
                    invoice=invoice,
                    amount=total_price,
                    mode=payment_method
                )
                invoice.is_paid = True
                invoice.balance_ptd = 0
                invoice.save()

        return Response({
            'message': 'Success',
            'invoice_id': invoice.id if invoice else None,
            'pass_ids': [p.id for p in created_passes]
        })

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
