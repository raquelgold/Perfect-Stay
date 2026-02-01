import { useState } from "react";
import { Moon, TreePine, Landmark, ShoppingBag, Trophy, Sparkles, MapPin, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { GameSelectionModal, Game } from "./GameSelectionModal";

interface HeroSectionProps {
  onCategorySelect: (category: string) => void;
  selectedCategories: string[];
  location: string;
  onLocationChange: (location: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
  onGameSelect?: (game: Game) => void;
  isGameModalOpen?: boolean;
  setIsGameModalOpen?: (isOpen: boolean) => void;
}

const categories = [
  {
    id: "nightlife",
    label: "Nightlife",
    description: "bars, pubs, theatres",
    icon: Moon,
  },
  {
    id: "nature",
    label: "Nature",
    description: "landmarks, parks, lakes",
    icon: TreePine,
  },
  {
    id: "tourist",
    label: "Tourist Attractions",
    description: "museums, zoos, amusement parks",
    icon: Landmark,
  },
  {
    id: "shopping",
    label: "Shopping",
    description: "outlets, markets, flea markets",
    icon: ShoppingBag,
  },
  {
    id: "relaxation",
    label: "Relaxation & Wellness",
    description: "spas, golf courses, retreats",
    icon: Sparkles,
  },
];

export function HeroSection({
  onCategorySelect,
  selectedCategories,
  location,
  onLocationChange,
  onSearch,
  isLoading = false,
  onGameSelect,
  isGameModalOpen,
  setIsGameModalOpen
}: HeroSectionProps) {
  // Use local state if props not provided (backward compatibility)
  const [localIsGameModalOpen, setLocalIsGameModalOpen] = useState(false);

  const isOpen = isGameModalOpen !== undefined ? isGameModalOpen : localIsGameModalOpen;
  const setIsOpen = setIsGameModalOpen || setLocalIsGameModalOpen;

  const isWorldCupSelected = selectedCategories.includes("worldcup");
  const canSearch = location.trim() !== "" && selectedCategories.length > 0;

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-full mx-auto">
          <h1 className="mb-6">
            Find Your Perfect Stay, Closer to What Matters
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-10">
            Discover properties based on proximity to your vacation goals—whether it's nightlife,
            nature, tourist attractions, or shopping. Your perfect location awaits.
          </p>

          {/* Location Input - Moved to top */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                <Input
                  type="text"
                  placeholder="Where are you traveling to? (e.g., London, Miami, Paris)"
                  value={location}
                  onChange={(e) => onLocationChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canSearch) {
                      onSearch();
                    }
                  }}
                  className="w-full h-14 pl-12 pr-4 text-base bg-white/95 text-gray-900 placeholder:text-gray-500 border-0 shadow-lg focus:ring-2 focus:ring-white/50 rounded-lg"
                />
              </div>
              <Button
                onClick={onSearch}
                disabled={!canSearch || isLoading}
                size="lg"
                className="h-14 px-8 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategories.includes(category.id);

              return (
                <Button
                  key={category.id}
                  onClick={() => onCategorySelect(category.id)}
                  className={`h-auto py-6 px-6 flex flex-col items-center gap-3 text-center transition-all ${isSelected
                    ? "bg-white text-blue-700 hover:bg-blue-50 ring-4 ring-white/30"
                    : "bg-white/10 text-white hover:bg-white/20 border-2 border-white/20"
                    }`}
                >
                  <Icon className="w-8 h-8" />
                  <div>
                    <div className="font-semibold mb-1">{category.label}</div>
                    <div className={`text-xs ${isSelected ? "text-blue-600" : "text-blue-100"}`}>
                      {category.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* FIFA World Cup Special Button */}
          <div className="relative w-full">
            <Button
              onClick={() => setIsOpen(true)}
              className={`w-full h-auto py-8 px-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center transition-all relative overflow-hidden ${isWorldCupSelected
                ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-gray-900 hover:from-amber-300 hover:via-yellow-400 hover:to-amber-300 ring-4 ring-yellow-300/50"
                : "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white hover:from-red-400 hover:via-orange-400 hover:to-yellow-400 border-2 border-yellow-300/50"
                }`}
            >
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/90 text-red-600 border-0 text-xs font-bold">
                  SPECIAL
                </Badge>
              </div>
              <Trophy className="w-10 h-10 animate-pulse" />
              <div className="flex flex-col items-center sm:items-start">
                <div className="text-xl font-bold mb-1 flex items-center gap-2">
                  FIFA World Cup 2026
                </div>
                <div className={`text-sm ${isWorldCupSelected ? "text-gray-700" : "text-yellow-50"}`}>
                  Find properties near stadiums in USA, Mexico & Canada
                </div>
              </div>
            </Button>
          </div>

          <GameSelectionModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSelectGame={(game) => {
              if (onGameSelect) {
                onGameSelect(game);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}