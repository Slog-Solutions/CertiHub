from django.db import models
from cloudinary_storage.storage import MediaCloudinaryStorage
from django.contrib.postgres.fields import ArrayField # Assuming PostgreSQL for ArrayField, but since we don't know the DB, I'll use TextField and split for simplicity, or just a simple CharField for features. Let's use a simple TextField for features and instruct the user to use a delimiter like a newline or bullet points.

# Reusable Cloudinary storage instance (optional but handy)
cloudinary_storage = MediaCloudinaryStorage()

class Mentor(models.Model):
    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=400)
    image = models.ImageField(
        upload_to='mentors/',
        storage=cloudinary_storage
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Lower number shows first"
    )

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.name


CATEGORY_CHOICES = [
    ("All Courses", "All Courses"),
    ("Computer Science", "Computer Science"),
    ("Civil Tools", "Civil Tools"),
    ("Mechanical Tools", "Mechanical Tools"),
    ("Architecture", "Architecture"),
    ("Specialized", "Specialized"),
    ("Networking", "Networking"),
    ("Creative Arts", "Creative Arts"),
]


class Course(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(
        upload_to="courses/",
        storage=cloudinary_storage
    )
    data_ai_hint = models.CharField(max_length=200, blank=True)
    duration = models.CharField(max_length=50)
    price = models.CharField(max_length=20)
    category = models.CharField(
        max_length=100,
        choices=CATEGORY_CHOICES,
    )
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title


class Gallery(models.Model):
    CATEGORY_CHOICES = [
        ("development", "Development"),
        ("corporate_defence_trainings", "Corporate & Defence Trainings"),
        ("outbound_trainings", "Outbound Trainings"),
        ("ministry_of_defence", "Ministry of Defence"),
        ("student_trainings", "Student Trainings"),
        ("achievements", "Achievements & Moments"),
    ]

    title = models.CharField(max_length=200, blank=True, null=True)
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="corporate_defence_trainings"
    )
    image = models.ImageField(
        upload_to="gallery/",
        storage=cloudinary_storage,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "-created_at"]

    def __str__(self):
        return f"{self.title or 'Image'} ({self.get_category_display()})"


class HeroSlide(models.Model):
    position = models.PositiveIntegerField(unique=True)  # 1 to 5 fixed
    image = models.ImageField(
        upload_to="hero_slides/",
        storage=cloudinary_storage
    )

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"Slide {self.position}"


# --- NEW PRODUCT MODEL ---

PRODUCT_SECTION_CHOICES = [
    ("software_development", "Software Development"),
    ("lab_setup", "Lab Setup"),
    ("product_development", "Product Development"),
]

class Product(models.Model):
    section = models.CharField(
        max_length=50,
        choices=PRODUCT_SECTION_CHOICES,
        default="software_development",
        help_text="The service section where this product will be displayed."
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    photo = models.ImageField(
        upload_to="products/",
        storage=cloudinary_storage,
        help_text="The main image for the product."
    )
    features = models.TextField(
        help_text="List each feature on a new line or use bullet points. This will be split into a list on the frontend."
    )
    
    class Meta:
        ordering = ["name"]
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def __str__(self):
        return self.name