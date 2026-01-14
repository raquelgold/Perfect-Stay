import { Slider } from "@/app/components/ui/slider";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

export interface Filters {
  maxPrice: number;
  maxDistance: number;
  minRating: number;
  amenities: string[];
  considerPrice: boolean;
}

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}

const availableAmenities = ["WiFi", "Parking", "Kitchen", "Pool"];

export function FilterSidebar({ filters, onFiltersChange, onReset }: FilterSidebarProps) {
  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    
    onFiltersChange({ ...filters, amenities: newAmenities });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Filters</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="considerPrice"
                checked={filters.considerPrice}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, considerPrice: checked as boolean })
                }
              />
              <Label htmlFor="considerPrice" className="cursor-pointer">
                Consider price in recommendations
              </Label>
            </div>
            
            {filters.considerPrice && (
              <>
                <Slider
                  value={[filters.maxPrice]}
                  onValueChange={([value]) => onFiltersChange({ ...filters, maxPrice: value })}
                  max={1000}
                  min={50}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>$50</span>
                  <span className="font-medium text-gray-900">Up to ${filters.maxPrice}</span>
                  <span>$1000</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distance from Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={[filters.maxDistance]}
              onValueChange={([value]) => onFiltersChange({ ...filters, maxDistance: value })}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>1 mi</span>
              <span className="font-medium text-gray-900">{filters.maxDistance} mi</span>
              <span>50 mi</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Minimum Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={[filters.minRating]}
              onValueChange={([value]) => onFiltersChange({ ...filters, minRating: value })}
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Any</span>
              <span className="font-medium text-gray-900">{filters.minRating}+ stars</span>
              <span>5</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={filters.amenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityToggle(amenity)}
                />
                <Label htmlFor={amenity} className="cursor-pointer">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}