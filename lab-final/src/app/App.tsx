import { useState, useRef } from "react";
import { HeroSection } from "@/app/components/HeroSection";
import { PropertyList } from "@/app/components/PropertyList";
import { Property } from "@/app/components/PropertyCard";
import { Game } from "@/app/components/GameSelectionModal";
import { searchProperties } from "@/app/api";

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

export default function App() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [location, setLocation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [gameCoords, setGameCoords] = useState<{ lat: number; long: number } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);


  const handleCategorySelect = (category: string) => {
    setSelectedCategories((prev) => {
      // If switching away from worldcup, clear game coords
      if (prev.includes("worldcup") && category !== "worldcup") {
        setGameCoords(null);
      }

      if (prev.includes(category)) {
        // Remove if already selected
        return prev.filter((c) => c !== category);
      } else {
        // Add if not selected
        return [...prev, category];
      }
    });
  };

  // Map frontend category IDs to backend goal names
  const mapCategoryToGoal = (categoryId: string): string => {
    if (categoryId === 'worldcup') return 'FIFA World Cup 2026';

    const categoryMap: Record<string, string> = {
      'nightlife': 'Nightlife',
      'nature': 'Nature',
      'tourist': 'Tourist Attractions',
      'shopping': 'Shopping',
      'relaxation': 'Wellness',
    };
    return categoryMap[categoryId] || 'Nightlife';
  };

  const handleGameSelect = async (game: Game) => {
    // 1. Update UI state
    setLocation(game.location);
    if (game.lat && game.long) {
      setGameCoords({ lat: game.lat, long: game.long });
    } else {
      setGameCoords(null);
    }

    // Ensure "worldcup" is selected
    if (!selectedCategories.includes("worldcup")) {
      setSelectedCategories(["worldcup"]);
    }

    // 2. Perform search immediately with the new data
    // We cannot rely on 'location' or 'gameCoords' state here as they update asynchronously
    setIsLoading(true);

    try {
      const searchData = {
        location: game.city, // Use strict city name for backend matching
        goal: mapCategoryToGoal("worldcup"),
        lat: game.lat,
        long: game.long
      };

      console.log("🚀 Auto-triggering World Cup search:", searchData);

      const results = await searchProperties(searchData);

      if (results.length === 0) {
        // alert("No properties found near this stadium.");
        // Don't alert for empty, just clear properties or show empty state
        setProperties([]);
      } else {
        setProperties(results);
      }

      // Auto-scroll
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error) {
      console.error("Error searching properties:", error);
      alert("Failed to search properties. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to search properties from backend
  const handleSearch = async () => {
    if (!location.trim() || selectedCategories.length === 0) {
      console.warn("Please enter a location and select at least one vacation goal");
      return;
    }

    setIsLoading(true);
    try {
      // Use the first selected category as the goal (backend only accepts one goal)
      const firstCategory = selectedCategories[0];
      const goal = mapCategoryToGoal(firstCategory);

      // Only send coords if it's a world cup search
      const isWorldCup = firstCategory === 'worldcup';
      const searchData = {
        location: location.trim(),
        goal: goal,
        lat: isWorldCup && gameCoords ? gameCoords.lat : undefined,
        long: isWorldCup && gameCoords ? gameCoords.long : undefined
      };

      console.log("🚀 Sending to backend:", searchData);

      const results = await searchProperties(searchData);
      console.log("✅ Received from backend:", results);

      if (results.length === 0) {
        console.warn("No properties found for the given criteria");
        alert("No properties found. Try a different location or vacation goal.");
      } else {
        setProperties(results);
      }
    } catch (error) {
      console.error("Error searching properties:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Full error details:", error);
      // Show error to user with more details
      alert(`Failed to search properties: ${errorMessage}\n\nPlease make sure:\n1. Backend server is running on port 5000\n2. Backend has access to the CSV file\n3. Check browser console for more details`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection
        onCategorySelect={handleCategorySelect}
        selectedCategories={selectedCategories}
        location={location}
        onLocationChange={setLocation}
        onSearch={handleSearch}
        isLoading={isLoading}
        onGameSelect={handleGameSelect}
      />

      <div ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedCategories.length > 0 && location && (
          <div className="mb-8">
            <h2 className="mb-2">
              Top Properties for {mapCategoryToGoal(selectedCategories[0])} in {location}
            </h2>
            <p className="text-gray-600">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
            </p>
          </div>
        )}

        <div className="flex gap-8">

          {/* Property Grid */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for properties...</p>
              </div>
            ) : selectedCategories.length > 0 && location ? (
              <PropertyList
                properties={properties}
                destination={mapCategoryToGoal(selectedCategories[0])}
                showPrice={true}
              />
            ) : (
              <div className="text-center py-20">
                <h3 className="text-gray-500 mb-2">
                  Enter a location and select a vacation goal to find properties
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