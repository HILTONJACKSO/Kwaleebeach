from django.db import models

class PassType(models.Model):
    name = models.CharField(max_length=50) # e.g. 'Pool Day Pass'
    price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=20, choices=[('POOL', 'Pool'), ('BEACH', 'Beach')], default='POOL')
    
    def __str__(self):
        return f"{self.name} (${self.price})"

class AccessPass(models.Model):
    STATUS_CHOICES = [('ACTIVE', 'Active'), ('EXPIRED', 'Expired'), ('CANCELLED', 'Cancelled')]
    pass_type = models.ForeignKey(PassType, on_delete=models.CASCADE)
    guest_name = models.CharField(max_length=100, blank=True, null=True)
    room = models.ForeignKey('pms.Room', on_delete=models.SET_NULL, blank=True, null=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    is_printed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pass {self.id} - {self.pass_type.name}"

class PassReturn(models.Model):
    STATUS_CHOICES = [('REQUESTED', 'Requested'), ('APPROVED_ADMIN', 'Approved by Admin'), ('REJECTED', 'Rejected'), ('COMPLETED', 'Completed')]
    access_pass = models.ForeignKey(AccessPass, on_delete=models.CASCADE, related_name='returns')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REQUESTED')
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Return Request {self.id} for Pass {self.access_pass.id}"

class Activity(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.CharField(max_length=255, blank=True, null=True)
    duration = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.title

class Package(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.title

class CSRProject(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    image_url = models.CharField(max_length=255, blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name
class Event(models.Model):
    STATUS_CHOICES = [
        ('PLANNING', 'Planning'),
        ('SCHEDULED', 'Scheduled'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled')
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField(default=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
