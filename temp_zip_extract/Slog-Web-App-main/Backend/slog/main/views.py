from rest_framework import viewsets
from .models import Course
from .serializers import CourseSerializer
from .models import Mentor
from .serializers import MentorSerializer
from .models import Course, Mentor, Gallery
from .serializers import CourseSerializer, MentorSerializer, GallerySerializer
from .models import Gallery
from .serializers import GallerySerializer
from .models import Course, Mentor, HeroSlide, Product
from .serializers import CourseSerializer, MentorSerializer, HeroSlideSerializer, ProductSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()      # <-- add this so DRF router can infer basename
    serializer_class = ProductSerializer

    def get_queryset(self):
        # You can keep this dynamic filtering on top of the base queryset
        queryset = super().get_queryset()  # now uses the class queryset
        section = self.request.query_params.get('section')
        if section is not None:
            queryset = queryset.filter(section=section)
        return queryset

class MentorViewSet(viewsets.ModelViewSet):
    queryset = Mentor.objects.all()
    serializer_class = MentorSerializer

class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer

    

class HeroSlideViewSet(viewsets.ModelViewSet):
    queryset = HeroSlide.objects.all().order_by("position")
    serializer_class = HeroSlideSerializer
