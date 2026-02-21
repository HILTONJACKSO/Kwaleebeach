from django.core.management.base import BaseCommand
from website.models import SiteConfig

class Command(BaseCommand):
    help = 'Seeds initial website configuration'

    def handle(self, *args, **kwargs):
        configs = [
            # HERO SECTION
            {
                'section': 'Hero',
                'key': 'hero_title_line_1',
                'label': 'Hero Title (Line 1)',
                'value': 'ONE CLICK',
                'field_type': 'text'
            },
            {
                'section': 'Hero',
                'key': 'hero_title_line_2',
                'label': 'Hero Title (Line 2)',
                'value': 'EASY BOOKING',
                'field_type': 'text'
            },
            {
                'section': 'Hero',
                'key': 'hero_bg_image',
                'label': 'Hero Background Image',
                'value': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1920&q=80',
                'field_type': 'image'
            },
            {
                'section': 'Hero',
                'key': 'hero_cta_video_poster',
                'label': 'Hero CTA Video Poster',
                'value': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80',
                'field_type': 'image'
            },
            {
                'section': 'Hero',
                'key': 'hero_cta_text',
                'label': 'Hero CTA Box Title',
                'value': 'Book Your Stay Now',
                'field_type': 'text'
            },
            {
                'section': 'Hero',
                'key': 'hero_cta_subtext',
                'label': 'Hero CTA Box Description',
                'value': 'Effortlessly manage your stay with our seamless hotel reservations.',
                'field_type': 'textarea'
            },

            # STATS SECTION
            {
                'section': 'Stats',
                'key': 'stats_title',
                'label': 'Stats Section Title',
                'value': 'Discover stays tailored to your dreams.',
                'field_type': 'text'
            },
            {
                'section': 'Stats',
                'key': 'stats_description',
                'label': 'Stats Section Description',
                'value': 'Luxury, comfort, or adventure — your journey begins here. Book Now and Unwind in Style!',
                'field_type': 'textarea'
            },
            {
                'section': 'Stats',
                'key': 'stats_hotel_count',
                'label': 'Total Hotels Count',
                'value': '160k+',
                'field_type': 'text'
            },
            {
                'section': 'Stats',
                'key': 'stats_country_count',
                'label': 'Countries Count',
                'value': '120+',
                'field_type': 'text'
            },

            # DINING SECTION
            {
                'section': 'Dining',
                'key': 'dining_restaurant_title',
                'label': 'Restaurant Title',
                'value': 'The Indigo Restaurant',
                'field_type': 'text'
            },
            {
                'section': 'Dining',
                'key': 'dining_restaurant_desc',
                'label': 'Restaurant Description',
                'value': 'Experience a culinary masterpiece where local Liberian flavors meet international fine dining.',
                'field_type': 'textarea'
            },
            {
                'section': 'Dining',
                'key': 'dining_restaurant_image',
                'label': 'Restaurant Image',
                'value': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
                'field_type': 'image'
            },
            {
                'section': 'Dining',
                'key': 'dining_bar_title',
                'label': 'Bar Title',
                'value': 'The Azure Bar',
                'field_type': 'text'
            },
            {
                'section': 'Dining',
                'key': 'dining_bar_desc',
                'label': 'Bar Description',
                'value': 'Sip on handcrafted cocktails while watching the Atlantic sunset from our premium lounge.',
                'field_type': 'textarea'
            },
            {
                'section': 'Dining',
                'key': 'dining_bar_image',
                'label': 'Bar Image',
                'value': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
                'field_type': 'image'
            },

            # EXPERIENCE SECTION
            {
                'section': 'Experiences',
                'key': 'exp_title',
                'label': 'Experience Section Title',
                'value': 'The Experience Collection',
                'field_type': 'text'
            },
            {
                'section': 'Experiences',
                'key': 'exp_desc',
                'label': 'Experience Section Description',
                'value': 'Beyond the luxury of your room lies a world of discovery. From hidden lagoons to premium coastal bundles.',
                'field_type': 'textarea'
            },

            # HOMEPAGE ADDITIONAL SECTIONS
            {
                'section': 'Homepage',
                'key': 'home_rooms_title',
                'label': 'Rooms Section Title',
                'value': 'Rooms That Feel Like Home',
                'field_type': 'text'
            },
            {
                'section': 'Homepage',
                'key': 'home_rooms_desc',
                'label': 'Rooms Section Description',
                'value': 'Comfort, style, and all the essentials—just like home, only better.',
                'field_type': 'textarea'
            },
            {
                'section': 'Homepage',
                'key': 'home_events_banner_title',
                'label': 'Events Banner Title',
                'value': 'Upcoming event at Kwalee Beach Resort Resort',
                'field_type': 'text'
            },
            {
                'section': 'Homepage',
                'key': 'home_events_section_title',
                'label': 'Events Grid Title',
                'value': 'Unforgettable Happenings',
                'field_type': 'text'
            },
            {
                'section': 'Homepage',
                'key': 'home_cta_title',
                'label': 'Dream Getaway Title',
                'value': "Your Dream Getaway Awaits — Don't Wait!",
                'field_type': 'text'
            },
            {
                'section': 'Homepage',
                'key': 'home_cta_desc',
                'label': 'Dream Getaway Description',
                'value': 'Ready to escape and create unforgettable memories? Book your stay now and experience luxury, comfort, and breathtaking views at Kwalee Beach Resort Resort.',
                'field_type': 'textarea'
            },
            {
                'section': 'Homepage',
                'key': 'home_testimonials_title',
                'label': 'Testimonials Title',
                'value': 'What Our Customers Says',
                'field_type': 'text'
            },
            {
                'section': 'Homepage',
                'key': 'home_brand_name',
                'label': 'Brand Name (Footer/Logo)',
                'value': 'Kwalee Beach Resort',
                'field_type': 'text'
            },

            # ACTIVITIES PAGE
            {
                'section': 'Activities Page',
                'key': 'act_hero_title',
                'label': 'Activities Hero Title',
                'value': 'The Experience Collection.',
                'field_type': 'text'
            },
            {
                'section': 'Activities Page',
                'key': 'act_hero_desc',
                'label': 'Activities Hero Description',
                'value': 'Beyond the luxury of your room lies a world of discovery. From hidden lagoons to premium coastal bundles, discover the soul of Kwalee Beach Resort.',
                'field_type': 'textarea'
            },
            {
                'section': 'Activities Page',
                'key': 'act_hero_bg',
                'label': 'Activities Hero Background',
                'value': 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=1920&q=80',
                'field_type': 'image'
            },

            # EVENTS PAGE
            {
                'section': 'Events Page',
                'key': 'evt_hero_title',
                'label': 'Events Hero Title',
                'value': 'Unforgettable Happenings.',
                'field_type': 'text'
            },
            {
                'section': 'Events Page',
                'key': 'evt_hero_desc',
                'label': 'Events Hero Description',
                'value': 'Discover the soul of Kwalee Beach Resort through our exclusively designed events, cultural journeys, and high-energy celebrations.',
                'field_type': 'textarea'
            },
            {
                'section': 'Events Page',
                'key': 'evt_hero_bg',
                'label': 'Events Hero Background',
                'value': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80',
                'field_type': 'image'
            },
        ]

        for config_data in configs:
            SiteConfig.objects.update_or_create(
                key=config_data['key'],
                defaults=config_data
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(configs)} website configurations.'))
