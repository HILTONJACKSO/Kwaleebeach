from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from .models import Room, Booking
from inventory.models import Order
from .serializers import RoomSerializer, BookingSerializer
from inventory.serializers import OrderSerializer
from rest_framework.views import APIView
from django.db.models import Q
from datetime import date
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

    def perform_create(self, serializer):
        # Data from request
        adults = self.request.data.get('adults', 2)
        children = self.request.data.get('children', 0)
        
        booking = serializer.save(adults=adults, children=children)
        
        # Calculate total price for the stay if not provided
        if not booking.total_price:
            num_nights = (booking.check_out - booking.check_in).days
            if num_nights <= 0: num_nights = 1
            booking.total_price = booking.room.price_per_night * num_nights
            booking.save()
        
        # Create Invoice for the room stay
        try:
            from finance.models import Invoice, InvoiceItem
            invoice = Invoice.objects.create(
                booking=booking,
                invoice_number=f"INV-ROOM-{uuid.uuid4().hex[:6].upper()}",
                total_ht=booking.total_price,
                total_ft=booking.total_price,
                balance_ptd=booking.total_price,
                is_paid=False
            )
            InvoiceItem.objects.create(
                invoice=invoice,
                description=f"Room Stay: {booking.room.room_number} ({booking.adults} Adults, {booking.children} Children)",
                quantity=1,
                unit_price=booking.total_price,
                total_line=booking.total_price
            )
        except Exception as e:
            print(f"Failed to create room invoice: {e}")

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
