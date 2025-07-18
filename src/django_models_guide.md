# Django Models Guide for Tax Organizer

## Database Schema Design

### 1. Base User Model Extension (if using Django's built-in User)

```python
# models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    # Extend Django's User model if needed
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 2. Tax Form Base Model

```python
class TaxFormBase(models.Model):
    """Base model for all tax forms"""
    
    FORM_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('completed', 'Completed'),
        ('submitted', 'Submitted'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=255, unique=True, blank=True)  # For anonymous users
    email = models.EmailField(blank=True, null=True)  # Optional email for contact
    
    # Form metadata
    status = models.CharField(max_length=20, choices=FORM_STATUS_CHOICES, default='draft')
    form_type = models.CharField(max_length=20)  # 'personal' or 'business'
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_saved = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    
    # Access control
    access_token = models.CharField(max_length=255, blank=True)  # For shareable links
    
    class Meta:
        abstract = True
        
    def save(self, *args, **kwargs):
        if not self.user_id:
            self.user_id = str(uuid.uuid4())
        if not self.access_token:
            self.access_token = str(uuid.uuid4())
        super().save(*args, **kwargs)
```

### 3. Personal Tax Form Model

```python
class PersonalTaxForm(TaxFormBase):
    """Personal tax form data"""
    
    # Basic Information
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    middle_initial = models.CharField(max_length=1, blank=True)
    ssn = models.CharField(max_length=11, blank=True)  # Format: XXX-XX-XXXX
    date_of_birth = models.DateField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    email_address = models.EmailField(blank=True)
    
    # Address
    street_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=2, blank=True)
    zip_code = models.CharField(max_length=10, blank=True)
    
    # Filing Status
    filing_status = models.CharField(max_length=30, blank=True)
    
    # Spouse Information (if married)
    spouse_first_name = models.CharField(max_length=100, blank=True)
    spouse_last_name = models.CharField(max_length=100, blank=True)
    spouse_ssn = models.CharField(max_length=11, blank=True)
    spouse_date_of_birth = models.DateField(blank=True, null=True)
    
    # JSON fields for complex data
    dependents_data = models.JSONField(default=list, blank=True)
    income_data = models.JSONField(default=dict, blank=True)
    deductions_data = models.JSONField(default=dict, blank=True)
    tax_payments_data = models.JSONField(default=dict, blank=True)
    general_questions_data = models.JSONField(default=dict, blank=True)
    
    # Signature
    signature_image = models.TextField(blank=True)  # Base64 encoded signature
    signature_date = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Personal Tax Form - {self.first_name} {self.last_name} ({self.user_id})"
```

### 4. Business Tax Form Model

```python
class BusinessTaxForm(TaxFormBase):
    """Business tax form data"""
    
    # Business Basic Information
    business_name = models.CharField(max_length=255, blank=True)
    business_type = models.CharField(max_length=50, blank=True)  # LLC, Corporation, etc.
    ein = models.CharField(max_length=10, blank=True)  # Format: XX-XXXXXXX
    business_phone = models.CharField(max_length=20, blank=True)
    business_email = models.EmailField(blank=True)
    
    # Business Address
    business_street_address = models.CharField(max_length=255, blank=True)
    business_city = models.CharField(max_length=100, blank=True)
    business_state = models.CharField(max_length=2, blank=True)
    business_zip_code = models.CharField(max_length=10, blank=True)
    
    # Business Details
    business_description = models.TextField(blank=True)
    date_business_started = models.DateField(blank=True, null=True)
    accounting_method = models.CharField(max_length=20, blank=True)  # Cash or Accrual
    
    # JSON fields for complex data
    owner_info_data = models.JSONField(default=dict, blank=True)
    income_expenses_data = models.JSONField(default=dict, blank=True)
    assets_data = models.JSONField(default=dict, blank=True)
    
    # Signature
    signature_image = models.TextField(blank=True)  # Base64 encoded signature
    signature_date = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Business Tax Form - {self.business_name} ({self.user_id})"
```

### 5. File Attachments Model (Optional)

```python
class TaxFormAttachment(models.Model):
    """For storing file attachments related to tax forms"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Polymorphic relationship
    personal_form = models.ForeignKey(PersonalTaxForm, on_delete=models.CASCADE, blank=True, null=True)
    business_form = models.ForeignKey(BusinessTaxForm, on_delete=models.CASCADE, blank=True, null=True)
    
    # File information
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)  # 'W2', '1099', 'receipt', etc.
    file_size = models.IntegerField()
    file_path = models.CharField(max_length=500)  # Storage path
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.file_name} ({self.file_type})"
```

## Django Views (API Endpoints)

### 1. Personal Tax Form Views

```python
# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML
import json

class PersonalTaxFormViewSet(viewsets.ModelViewSet):
    queryset = PersonalTaxForm.objects.all()
    serializer_class = PersonalTaxFormSerializer
    lookup_field = 'user_id'
    
    def create(self, request):
        """Create new personal tax form"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            form = serializer.save(form_type='personal')
            return Response({
                'user_id': form.user_id,
                'access_token': form.access_token,
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, user_id=None):
        """Update existing personal tax form"""
        try:
            form = PersonalTaxForm.objects.get(user_id=user_id)
            serializer = self.get_serializer(form, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except PersonalTaxForm.DoesNotExist:
            return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, user_id=None):
        """Submit the form (mark as completed)"""
        try:
            form = PersonalTaxForm.objects.get(user_id=user_id)
            form.status = 'completed'
            form.submitted_at = timezone.now()
            
            # Update form data
            serializer = self.get_serializer(form, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                return Response({
                    'message': 'Form submitted successfully',
                    'user_id': form.user_id,
                    'view_link': f'/view?userId={form.user_id}&type=personal',
                    'pdf_link': f'/api/personal-tax/{form.user_id}/pdf/',
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except PersonalTaxForm.DoesNotExist:
            return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['patch'])
    def auto_save(self, request, user_id=None):
        """Auto-save form data"""
        try:
            form = PersonalTaxForm.objects.get(user_id=user_id)
            serializer = self.get_serializer(form, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Auto-saved successfully'})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except PersonalTaxForm.DoesNotExist:
            return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, user_id=None):
        """Generate and return PDF of the form"""
        try:
            form = PersonalTaxForm.objects.get(user_id=user_id)
            
            # Render HTML template with form data
            html_content = render_to_string('personal_tax_form.html', {
                'form': form,
                'form_data': {
                    'basic_info': form.__dict__,
                    'dependents': form.dependents_data,
                    'income': form.income_data,
                    'deductions': form.deductions_data,
                    'tax_payments': form.tax_payments_data,
                    'general_questions': form.general_questions_data,
                }
            })
            
            # Generate PDF
            pdf = HTML(string=html_content).write_pdf()
            
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="personal_tax_form_{user_id}.pdf"'
            return response
            
        except PersonalTaxForm.DoesNotExist:
            return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
```

### 2. Serializers

```python
# serializers.py
from rest_framework import serializers

class PersonalTaxFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalTaxForm
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'user_id', 'access_token')
    
    def update(self, instance, validated_data):
        # Handle JSON field updates
        for field in ['dependents_data', 'income_data', 'deductions_data', 'tax_payments_data', 'general_questions_data']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        
        # Update other fields
        for attr, value in validated_data.items():
            if attr not in ['dependents_data', 'income_data', 'deductions_data', 'tax_payments_data', 'general_questions_data']:
                setattr(instance, attr, value)
        
        instance.save()
        return instance

class BusinessTaxFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessTaxForm
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'user_id', 'access_token')
```

### 3. URL Configuration

```python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'personal-tax', PersonalTaxFormViewSet)
router.register(r'business-tax', BusinessTaxFormViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
```

## Frontend Environment Variable

Add this to your `.env.local` file in your React app:

```
REACT_APP_API_URL=http://localhost:8000/api
```

## Django Settings

```python
# settings.py
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your-frontend-domain.com']

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
    "https://your-frontend-domain.com",
]

CORS_ALLOW_CREDENTIALS = True

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'tax_organizer_db',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Key Features Implemented:

1. **Resume Functionality**: Forms can be loaded by userId from URL parameters
2. **Auto-save**: Form data is automatically saved to the backend every 3 seconds
3. **Status Tracking**: Forms have draft/completed/submitted status
4. **Unique Links**: Each form gets a unique userId for sharing
5. **PDF Generation**: Completed forms can be downloaded as PDFs
6. **API Integration**: Complete REST API for all CRUD operations
7. **Error Handling**: Proper error handling and user notifications

The frontend is now fully integrated with your Django backend!