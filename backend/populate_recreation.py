import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Kwalee Beach Resort_backend.settings')
django.setup()

from recreation.models import Activity, Package

def populate():
    # Activities (Daily Tours & Experiences)
    activities = [
        # -- Tours --
        {
            "title": "Tour at the Local Village",
            "description": "Immerse yourself in authentic Liberian culture. Visit our neighboring community to learn about traditional customs, architecture, and daily life. (Coming Soon)",
            "price": 20.00,
            "duration": "3 Hours",
            "image_url": "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Libassa Wildlife Sanctuary Tour",
            "description": "A heart-warming visit to the sanctuary dedicated to rescuing and rehabilitating Liberia's endemic wildlife. See pangolins, monkeys, and dwarf crocodiles up close.",
            "price": 25.00,
            "duration": "4 Hours",
            "image_url": "https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Ocean Fishing Adventure",
            "description": "Head out into the Atlantic for a morning of sport fishing. Our expert crew handles everything from gear to finding the best spots for local catch.",
            "price": 25.00,
            "duration": "4 Hours",
            "image_url": "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Lagoon Swimming & Relaxation",
            "description": "Enjoy the calm, crystal-clear waters of the Marshall Lagoon. Perfect for families and those looking for a peaceful dip away from the ocean waves.",
            "price": 0.00,
            "duration": "Flexible",
            "image_url": "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Chimpanzees Island Tour",
            "description": "Take a boat ride to the famous Monkey Island. Witness the intelligence of our closest relatives in their natural habitat. (Coming Soon)",
            "price": 30.00,
            "duration": "2 Hours",
            "image_url": "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Marshall Fishing Village Tour",
            "description": "Visit the historic Marshall fishing community. See the colorful boats, learn about traditional fishing techniques, and enjoy the local atmosphere.",
            "price": 25.00,
            "duration": "3 Hours",
            "image_url": "https://images.unsplash.com/photo-1596701062351-8c2c14d1fcd1?auto=format&fit=crop&w=800&q=80"
        },
        # -- Sports --
        {
            "title": "Beach Soccer",
            "description": "Gather a team for a high-energy match on our sandy courts. (Deposit: $10 for gear)",
            "price": 10.00,
            "duration": "2 Hours",
            "image_url": "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Beach Volleyball",
            "description": "Fun in the sun for all skill levels. Challenge your friends to a set by the ocean. (Deposit: $10 for gear)",
            "price": 10.00,
            "duration": "2 Hours",
            "image_url": "https://images.unsplash.com/photo-1593766788306-28561086694e?auto=format&fit=crop&w=800&q=80"
        },
        # -- Culture --
        {
            "title": "Community Culture Performance",
            "description": "Experience the vibrant heartbeat of Liberia through traditional drumming, singing, and storytelling by local performers.",
            "price": 20.00,
            "duration": "1.5 Hours",
            "image_url": "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Culture Dance Class",
            "description": "Learn the energetic and expressive moves of traditional Liberian dance in this fun, interactive workshop.",
            "price": 20.00,
            "duration": "1.5 Hours",
            "image_url": "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Local Culinary Class",
            "description": "Master the secrets of Liberian cuisine. Learn to prepare traditional dishes using fresh local ingredients.",
            "price": 20.00,
            "duration": "2.5 Hours",
            "image_url": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
        },
        # -- Games --
        {
            "title": "Board and Card Games",
            "description": "Relax with a selection of classic and local games. Perfect for a quiet afternoon. (Deposit: $10 for gear)",
            "price": 10.00,
            "duration": "Flexible",
            "image_url": "https://images.unsplash.com/photo-1629904853716-f0bc54ea4813?auto=format&fit=crop&w=800&q=80"
        },
        # -- Nightlife & Special --
        {
            "title": "Bonfire Night",
            "description": "Settle by the warm glow of a beach bonfire under the stars. Marshmallows and storytelling included.",
            "price": 20.00,
            "duration": "3 Hours",
            "image_url": "https://images.unsplash.com/photo-1549443585-70364d962071?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Jazz Night at the Lounge",
            "description": "Suave and sophisticated rhythms to accompany your evening cocktails. Professional live ensemble.",
            "price": 15.00,
            "duration": "3 Hours",
            "image_url": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Karaoke Night",
            "description": "Unleash your inner star! Join us for a high-energy evening of song and laughter.",
            "price": 15.00,
            "duration": "3 Hours",
            "image_url": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80"
        },
    ]

    # Packages (Multi-day, Tiered Dining, Decor)
    packages = [
        # -- Movie Nights --
        {
            "title": "Movie Night: Standard",
            "description": "Cozy beach seating and a shared screen experience. Includes popcorn and a soft drink.",
            "price": 20.00,
            "image_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Movie Night: Premium",
            "description": "Enhanced seating with blankets, private audio, and a selection of gourmet snacks and drinks.",
            "price": 40.00,
            "image_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Movie Night: VVIP",
            "description": "Private beach setup, premium lounge furniture, gourmet 3-course platter and bottle of bubbly.",
            "price": 60.00,
            "image_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
        },
        # -- Romantic Beach Dinners --
        {
            "title": "Romantic Beach Dinner: Standard",
            "description": "Private candlelit table for two on the sand with a 3-course curated menu.",
            "price": 130.00,
            "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Romantic Beach Dinner: Premium",
            "description": "Vibrant beach setup, floral arrangements, 4-course gourmet menu, and a dedicated server.",
            "price": 160.00,
            "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Romantic Beach Dinner: VVIP",
            "description": "Ultimate private beach escape. Live musician, 5-course signature menu, premium wine, and tiki torch perimeter.",
            "price": 200.00,
            "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
        },
        # -- Poolside Dinners --
        {
            "title": "Poolside Dinner: Standard",
            "description": "Charming table for two by our illuminated infinity pool with a chef's special 3-course meal.",
            "price": 80.00,
            "image_url": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Poolside Dinner: Premium",
            "description": "Prime poolside spot with mood lighting, 4-course menu including seafood specialties.",
            "price": 100.00,
            "image_url": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Poolside Dinner: VVIP",
            "description": "Private cabana dining, 5-course menu, champagne toast, and personalized service.",
            "price": 150.00,
            "image_url": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80"
        },
        # -- Floating Brunch & Breakfast --
        {
            "title": "Floating Brunch",
            "description": "Experience luxury with a gourmet brunch served on a beautiful floating tray in your private pool or our main pool.",
            "price": 100.00,
            "image_url": "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Floating Breakfast",
            "description": "Start your day with an iconic floating breakfast. Assorted pastries, fresh fruits, and hot breakfast items.",
            "price": 60.00,
            "image_url": "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=800&q=80"
        },
        # -- Bed Decorations --
        {
            "title": "Bed Decoration: Standard",
            "description": "Beautiful swan towels and a splash of local flower petals for a romantic welcome.",
            "price": 30.00,
            "image_url": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Bed Decoration: Premium",
            "description": "Elaborate floral heart designs, scented candles, and premium linen preparation.",
            "price": 60.00,
            "image_url": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Bed Decoration: VIP",
            "description": "Full room floral styling, artisanal chocolates, and a personalized welcome gift.",
            "price": 80.00,
            "image_url": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Bed Decoration: VVIP",
            "description": "Ultimate celebration setup. Breathtaking floral architecture, chilled champagne, and a bespoke experience gift.",
            "price": 100.00,
            "image_url": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
        },
        # -- Special --
        {
            "title": "Kwalee Magical Package",
            "description": "Our signature transformative experience. A journey of the senses that captures the true magic of Kwalee Beach Resort. (Coming Soon)",
            "price": 0.00,
            "image_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80"
        },
    ]

    print("Cleaning existing records...")
    Activity.objects.all().delete()
    Package.objects.all().delete()

    print("Populating Activities...")
    for act in activities:
        Activity.objects.create(
            title=act['title'],
            description=act['description'],
            price=act['price'],
            duration=act['duration'],
            image_url=act['image_url']
        )

    print("Populating Packages...")
    for pkg in packages:
        Package.objects.create(
            title=pkg['title'],
            description=pkg['description'],
            price=pkg['price'],
            image_url=pkg['image_url']
        )

    print("Success! Recreation data populated.")

if __name__ == "__main__":
    populate()
