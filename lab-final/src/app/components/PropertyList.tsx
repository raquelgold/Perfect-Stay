import { PropertyCard, Property } from "@/app/components/PropertyCard";

interface PropertyListProps {
  properties: Property[];
  destination: string;
  showPrice: boolean;
}

export function PropertyList({ properties, destination, showPrice }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No properties found matching your criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  // Filter properties by source
  const airbnbProperties = properties.filter(p => p.source === 'airbnb' || !p.source).slice(0, 4);
  const bookingProperties = properties.filter(p => p.source === 'booking').slice(0, 4);

  return (
    <div className="space-y-12">
      {/* Airbnb Section */}
      {airbnbProperties.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Top 4 properties of Airbnb</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {airbnbProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                destination={destination}
                showPrice={showPrice}
              />
            ))}
          </div>
        </div>
      )}

      {/* Booking.com Section */}
      {bookingProperties.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Top 4 properties of Booking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookingProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                destination={destination}
                showPrice={showPrice}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}