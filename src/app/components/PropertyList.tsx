import { PropertyCard, Property } from "@/app/components/PropertyCard";

interface PropertyListProps {
  properties: Property[];
  destination: string;
}

export function PropertyList({ properties, destination }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No properties found matching your criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          destination={destination}
        />
      ))}
    </div>
  );
}
