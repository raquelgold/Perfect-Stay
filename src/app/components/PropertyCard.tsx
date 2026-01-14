import { MapPin, Star, Wifi, Car, Utensils, Waves } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
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
}

interface PropertyCardProps {
  property: Property;
  destination: string;
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  kitchen: Utensils,
  pool: Waves,
};

export function PropertyCard({ property, destination }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative h-56 overflow-hidden">
        <ImageWithFallback
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 right-3 bg-blue-600 text-white border-0">
          {property.distance} mi away
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 line-clamp-1">{property.name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">
              {property.rating} <span className="text-gray-500">({property.reviews})</span>
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
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>{property.guests} guests</span>
            <span>•</span>
            <span>{property.bedrooms} bedrooms</span>
            <span>•</span>
            <span>{property.bathrooms} baths</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {property.amenities.slice(0, 4).map((amenity) => {
              const Icon = amenityIcons[amenity.toLowerCase()];
              return (
                <div
                  key={amenity}
                  className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <span className="text-gray-500 text-sm">from </span>
            <span className="text-2xl">${property.price}</span>
            <span className="text-gray-500 text-sm"> / night</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
