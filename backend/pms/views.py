from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from .models import Room, Booking
from inventory.models import Order
from .serializers import RoomSerializer, BookingSerializer
from inventory.serializers import OrderSerializer
from rest_framework.views import APIView
from django.db.models import Q
from datetime import date
from decimal import Decimal
import uuid
import logging
import traceback

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

logger = logging.getLogger(__name__)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by('room_number')
    serializer_class = RoomSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        log_file = '/var/www/kwaleebeach/backend/room_debug.log'
        with open(log_file, 'a') as f:
            f.write(f"\n--- New Request {date.today()} ---\n")
            f.write(f"Data: {request.data}\n")
        
        try:
            serializer = self.get_serializer(data=request.data)
            if (not serializer.is_valid()):
                with open(log_file, 'a') as f:
                    f.write(f"Validation Errors: {serializer.errors}\n")
                
                # Convert serializer errors to a readable string for the frontend
                error_details = []
                for field, errors in serializer.errors.items():
                    error_details.append(f"{field}: {', '.join(errors) if isinstance(errors, list) else str(errors)}")
                
                return Response({'detail': '; '.join(error_details)}, status=status.HTTP_400_BAD_REQUEST)
            
            return super().create(request, *args, **kwargs)
        except Exception as e:
            with open(log_file, 'a') as f:
                f.write(f"CRITICAL ERROR: {str(e)}\n")
                f.write(traceback.format_exc())
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        room_ids = request.data.get('room_ids', [])
        if not room_ids and request.data.get('room'):
            room_ids = [request.data.get('room')]
            
        if not room_ids:
            return Response({"detail": "No rooms selected or 'room_ids' missing."}, status=status.HTTP_400_BAD_REQUEST)

        bookings = []
        total_invoice_amount = 0
        
        # We'll use the first booking as the primary reference for the Invoice model's booking field
        primary_booking = None

        for room_id in room_ids:
            data = request.data.copy()
            data['room'] = room_id
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            
            # Save booking with guest count
            adults = data.get('adults', 2)
            children = data.get('children', 0)
            booking = serializer.save(adults=adults, children=children)
            
            # Calculate price
            num_nights = (booking.check_out - booking.check_in).days
            if num_nights <= 0: num_nights = 1
            booking.total_price = booking.room.price_per_night * num_nights
            booking.save()
            
            bookings.append(booking)
            total_invoice_amount += booking.total_price
            if not primary_booking:
                primary_booking = booking

        # Handle activities if provided
        selected_activities = request.data.get('selected_activities', [])
        activities_total = sum(float(a.get('price', 0)) for a in selected_activities)
        total_invoice_amount += Decimal(str(activities_total))

        # Create ONE consolidated Invoice
        try:
            from finance.models import Invoice, InvoiceItem
            import uuid
            
            invoice = Invoice.objects.create(
                booking=primary_booking,
                invoice_number=f"INV-GRP-{uuid.uuid4().hex[:6].upper()}",
                total_ht=total_invoice_amount,
                total_ft=total_invoice_amount,
                balance_ptd=total_invoice_amount,
                is_paid=False
            )
            
            # Add line items for each room
            for b in bookings:
                InvoiceItem.objects.create(
                    invoice=invoice,
                    description=f"Accommodation: {b.room.room_type} ({b.room.room_number})",
                    quantity=1,
                    unit_price=b.total_price,
                    total_line=b.total_price
                )
            
            # Add line items for activities
            for activity in selected_activities:
                InvoiceItem.objects.create(
                    invoice=invoice,
                    description=f"Activity: {activity.get('title')}",
                    quantity=1,
                    unit_price=Decimal(str(activity.get('price'))),
                    total_line=Decimal(str(activity.get('price')))
                )
                
        except Exception as e:
            print(f"Failed to create consolidated invoice: {e}")

        return Response(self.get_serializer(bookings, many=True).data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        # This is now handled by the overridden create method
        pass

class GlobalSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'rooms': [], 'bookings': [], 'orders': []})

        # Search Rooms
        rooms = Room.objects.filter(
            Q(room_number__icontains=query) | Q(room_type__icontains=query)
        )[:5]
        
        # Search Bookings
        bookings = Booking.objects.filter(
            Q(guest_name__icontains=query)
        ).order_by('-created_at')[:5]
        
        # Search Orders
        orders = Order.objects.filter(
            Q(room__icontains=query) | Q(id__icontains=query.replace('#', ''))
        ).order_by('-created_at')[:5]

        return Response({
            'rooms': RoomSerializer(rooms, many=True).data,
            'bookings': BookingSerializer(bookings, many=True).data,
            'orders': OrderSerializer(orders, many=True).data
        })
