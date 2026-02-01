import { MapPin, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

export interface Property {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  distance: number;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  amenities: string[];
  location: string;
  safety_alert?: string;
  url?: string;
  source?: 'airbnb' | 'booking';
}

interface PropertyCardProps {
  property: Property;
  destination: string;
  showPrice: boolean;
}

export function PropertyCard({ property, showPrice }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col group">
      <a href={property.url || "#"} target="_blank" rel="noopener noreferrer" className="block relative h-56 overflow-hidden">
        <ImageWithFallback
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

      </a>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <a href={property.url || "#"} target="_blank" rel="noopener noreferrer" className="flex-1 hover:underline">
            <h3 className="font-semibold text-lg leading-tight">{property.name}</h3>
          </a>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">
              {property.rating} {property.reviews > 0 && <span className="text-gray-500">({property.reviews})</span>}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-600 mt-1">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{property.location}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          {property.safety_alert && (
            <div className={`mb-4 p-3 rounded-md text-sm border flex items-start gap-2 ${property.safety_alert.toLowerCase().includes('verified')
                ? 'bg-green-50 text-green-800 border-green-100'
                : 'bg-red-50 text-red-800 border-red-100'
              }`}>
              <span className="font-semibold shrink-0">
                {property.safety_alert.toLowerCase().includes('verified') ? 'Verified:' : 'Alert:'}
              </span>
              <span>{property.safety_alert.replace(/^Verified:\s*/i, '')}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {/* Amenities removed as per request */}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          {showPrice && (
            <div>
              {property.price === 0 ? (
                <span className="text-gray-500 font-medium">No price available</span>
              ) : (
                <>
                  <span className="text-gray-500 text-sm">from </span>
                  <span className="text-2xl font-bold">${property.price}</span>
                  <span className="text-gray-500 text-sm"> / night</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}