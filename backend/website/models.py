from django.db import models

class SiteConfig(models.Model):
    FIELD_TYPES = [
        ('text', 'Short Text'),
        ('textarea', 'Large Text'),
        ('image', 'Image URL'),
        ('color', 'Color Code'),
    ]

    section = models.CharField(max_length=50, help_text="e.g. Hero, About, Gallery")
    key = models.CharField(max_length=100, unique=True, help_text="e.g. hero_title, hero_bg")
    label = models.CharField(max_length=100, help_text="Human readable name for the admin UI")
    value = models.TextField()
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES, default='text')
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Website Configuration"
        verbose_name_plural = "Website Configurations"
        ordering = ['section', 'label']

    def __str__(self):
        return f"{self.section} - {self.label}"
