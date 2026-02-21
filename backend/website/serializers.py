from rest_framework import serializers
from .models import SiteConfig

class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = ['id', 'section', 'key', 'label', 'value', 'field_type', 'last_updated']
        read_only_fields = ['id', 'last_updated']
