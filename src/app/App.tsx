import { useState, useMemo } from "react";
import { HeroSection } from "@/app/components/HeroSection";
import { FilterSidebar, Filters } from "@/app/components/FilterSidebar";
import { PropertyList } from "@/app/components/PropertyList";
import { Property } from "@/app/components/PropertyCard";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/app/components/ui/sheet";

// Mock property data
const mockProperties: Property[] = [
  {
    id: "1",
    name: "Oceanfront Paradise Villa",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aWxsYXxlbnwxfHx8fDE3Njg0MDAzOTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 450,
    rating: 4.9,
    reviews: 127,
    distance: 2.3,
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    amenities: ["WiFi", "Pool", "Kitchen", "Parking"],
    location: "Miami Beach, FL",
  },
  {
    id: "2",
    name: "Cozy Mountain Retreat",
    image: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGNhYmlufGVufDF8fHx8MTc2ODM2OTcxMHww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 220,
    rating: 4.8,
    reviews: 89,
    distance: 5.1,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    amenities: ["WiFi", "Kitchen", "Parking"],
    location: "Aspen, CO",
  },
  {
    id: "3",
    name: "Modern Downtown Loft",
    image: "https://images.unsplash.com/photo-1649429710616-dad56ce9a076?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXBhcnRtZW50fGVufDF8fHx8MTc2ODM5MTg3MHww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 180,
    rating: 4.6,
    reviews: 203,
    distance: 1.2,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ["WiFi", "Kitchen"],
    location: "Orlando, FL",
  },
  {
    id: "4",
    name: "Beachside Cottage",
    image: "https://images.unsplash.com/photo-1528913775512-624d24b27b96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGhvdXNlJTIwcmVudGFsfGVufDF8fHx8MTc2ODM2NTEwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 320,
    rating: 4.7,
    reviews: 156,
    distance: 3.8,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ["WiFi", "Kitchen", "Parking", "Pool"],
    location: "Malibu, CA",
  },
  {
    id: "5",
    name: "Luxury Estate with Pool",
    image: "https://images.unsplash.com/photo-1635286721033-e11cf9e632c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2YWNhdGlvbiUyMGhvbWV8ZW58MXx8fHwxNzY4MzY2OTIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 680,
    rating: 5.0,
    reviews: 94,
    distance: 4.5,
    bedrooms: 5,
    bathrooms: 4,
    guests: 10,
    amenities: ["WiFi", "Pool", "Kitchen", "Parking"],
    location: "Scottsdale, AZ",
  },
  {
    id: "6",
    name: "Charming Lakeside Cabin",
    image: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGNhYmlufGVufDF8fHx8MTc2ODM2OTcxMHww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 195,
    rating: 4.5,
    reviews: 67,
    distance: 7.2,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ["WiFi", "Kitchen", "Parking"],
    location: "Lake Tahoe, CA",
  },
  {
    id: "7",
    name: "Urban Penthouse Suite",
    image: "https://images.unsplash.com/photo-1649429710616-dad56ce9a076?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXBhcnRtZW50fGVufDF8fHx8MTc2ODM5MTg3MHww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 420,
    rating: 4.8,
    reviews: 178,
    distance: 0.8,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    amenities: ["WiFi", "Kitchen", "Pool"],
    location: "Las Vegas, NV",
  },
  {
    id: "8",
    name: "Tropical Beach House",
    image: "https://images.unsplash.com/photo-1528913775512-624d24b27b96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGhvdXNlJTIwcmVudGFsfGVufDF8fHx8MTc2ODM2NTEwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 550,
    rating: 4.9,
    reviews: 142,
    distance: 6.3,
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    amenities: ["WiFi", "Pool", "Kitchen", "Parking"],
    location: "Maui, HI",
  },
  {
    id: "9",
    name: "Rustic Mountain Lodge",
    image: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGNhYmlufGVufDF8fHx8MTc2ODM2OTcxMHww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 280,
    rating: 4.7,
    reviews: 115,
    distance: 8.9,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ["WiFi", "Kitchen", "Parking"],
    location: "Jackson Hole, WY",
  },
];

const defaultFilters: Filters = {
  maxPrice: 1000,
  maxDistance: 50,
  minRating: 0,
  amenities: [],
  considerPrice: true,
};

export default function App() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [location, setLocation] = useState<string>("");

  const handleCategorySelect = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // Remove if already selected
        return prev.filter((c) => c !== category);
      } else {
        // Add if not selected
        return [...prev, category];
      }
    });
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const filteredProperties = useMemo(() => {
    return mockProperties
      .filter((property) => {
        // Apply filters
        if (filters.considerPrice && property.price > filters.maxPrice) return false;
        if (property.distance > filters.maxDistance) return false;
        if (property.rating < filters.minRating) return false;
        
        // Check amenities
        if (filters.amenities.length > 0) {
          const hasAllAmenities = filters.amenities.every((amenity) =>
            property.amenities.includes(amenity)
          );
          if (!hasAllAmenities) return false;
        }
        
        return true;
      })
      .sort((a, b) => a.distance - b.distance); // Sort by distance
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection
        onCategorySelect={handleCategorySelect}
        selectedCategories={selectedCategories}
        location={location}
        onLocationChange={setLocation}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-2">
              Properties Near: {selectedCategories.join(", ")}
            </h2>
            <p className="text-gray-600">
              {filteredProperties.length} properties found, sorted by proximity
              {location && ` in ${location}`}
            </p>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-6">
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="rounded-full shadow-lg">
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Properties</SheetTitle>
                  <SheetDescription>
                    Adjust filters to refine your property search
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar
                    filters={filters}
                    onFiltersChange={setFilters}
                    onReset={handleResetFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Property Grid */}
          <main className="flex-1 min-w-0">
            {selectedCategories.length > 0 ? (
              <PropertyList properties={filteredProperties} destination={selectedCategories.join(", ")} />
            ) : (
              <div className="text-center py-20">
                <h3 className="text-gray-500 mb-2">
                  Select a vacation goal category to find properties
                </h3>
                <p className="text-gray-400">
                  Choose from Nightlife, Nature, Tourist Attractions, Shopping or Wellness
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}