from rest_framework import serializers
from .models import PassType, AccessPass, PassReturn, Activity, Package, CSRProject, Event

class PassTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassType
        fields = '__all__'

class PassReturnSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassReturn
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'

class CSRProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = CSRProject
        fields = '__all__'

class AccessPassSerializer(serializers.ModelSerializer):
    pass_type_name = serializers.CharField(source='pass_type.name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    returns = PassReturnSerializer(many=True, read_only=True)
    
    class Meta:
        model = AccessPass
        fields = ['id', 'pass_type', 'pass_type_name', 'guest_name', 'room', 'room_number', 'amount_paid', 'status', 'is_printed', 'created_at', 'returns']
        read_only_fields = ['amount_paid', 'status', 'is_printed', 'created_at']
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
