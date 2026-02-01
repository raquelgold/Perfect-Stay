// API utility for backend communication

export interface SearchRequest {
  location: string;
  goal: string; // e.g., "Nightlife", "Nature", "Tourist Attractions", "Shopping", "Wellness"
  // Backend accepts either 'goal' (string) or 'goals' (array)
  lat?: number;
  long?: number;
}

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
  source?: 'airbnb' | 'booking';
  safety_alert?: string;
}

// Backend URL - Flask server runs on port 5000
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Map backend CSV record to frontend Property interface
 */
function mapBackendRecordToProperty(record: any, index: number): Property {
  // Map goal names from frontend to backend format
  const goalMap: Record<string, string> = {
    'nightlife': 'Nightlife',
    'nature': 'Nature',
    'tourist': 'Tourist Attractions',
    'shopping': 'Shopping',
    'relaxation': 'Wellness',
  };

  // Extract data from CSV record (adjust field names based on your CSV structure)
  // Common CSV fields: name, price, lat, long, bedrooms, bathrooms, etc.
  const name = record.name || record.listing_name || record.title || `Property ${index + 1}`;
  const price = record.price || record.price_per_night || record.nightly_rate || 0;
  const lat = record.lat || record.latitude || 0;
  const lon = record.long || record.longitude || record.lon || 0;
  const bedrooms = record.bedrooms || record.beds || 0;
  const bathrooms = record.bathrooms || record.baths || 0;
  const guests = record.guests || record.accommodates || bedrooms * 2 || 2;
  const rating = record.rating || record.review_scores_rating || 4.5;
  const reviews = record.reviews || record.number_of_reviews || 0;
  const location = record.location || record.city || record.neighbourhood || 'Unknown';
  const source = record.source || (index % 2 === 0 ? 'airbnb' : 'booking'); // Fallback if missing, but backend sends it

  // Handle image - use provided image or default
  let image = record.image || record.picture_url || record.thumbnail_url;

  // Handle 'images' from Booking data (often a string representation of a list)
  if (!image && record.images) {
    let rawImages = record.images;

    // If it's a string looking like a list "['url', ...]", extract the first one
    if (typeof rawImages === 'string') {
      // Remove brackets and quotes
      const cleanImages = rawImages.replace(/^\['|'\]$/g, "").replace(/^\["|"\]$/g, "");
      const firstImage = cleanImages.split("', '")[0].split('", "')[0];
      if (firstImage && firstImage.startsWith('http')) {
        image = firstImage;
      }
    } else if (Array.isArray(rawImages) && rawImages.length > 0) {
      image = rawImages[0];
    }
  }

  // Fallback default image
  if (!image) {
    image = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
  }

  // Handle amenities - convert to array if needed
  let amenities: string[] = [];
  if (record.amenities) {
    if (Array.isArray(record.amenities)) {
      amenities = record.amenities;
    } else if (typeof record.amenities === 'string') {
      amenities = record.amenities.split(',').map((a: string) => a.trim());
    }
  }

  // Default amenities if none provided
  if (amenities.length === 0) {
    amenities = ['WiFi', 'Kitchen'];
  }

  // Calculate distance (placeholder - backend doesn't return distance, so we'll use 0 or a default)
  const distance = record.distance || 0;

  return {
    id: record.id || record.listing_id || `property-${index}`,
    name,
    image,
    price: Math.round(price),
    rating: parseFloat(rating) || 4.5,
    reviews: parseInt(reviews) || 0,
    distance: parseFloat(distance) || 0,
    bedrooms: parseInt(bedrooms) || 1,
    bathrooms: parseInt(bathrooms) || 1,
    guests: parseInt(guests) || 2,
    amenities,
    location,
    source: source as 'airbnb' | 'booking',
    safety_alert: record.safety_alert || record.safet_alert || null,
  };
}

/**
 * Search for properties based on user input
 * Connects to Flask backend at /recommend endpoint
 */
export async function searchProperties(searchData: SearchRequest): Promise<Property[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: searchData.location,
        goals: [searchData.goal], // Backend expects 'goals' as an array
        lat: searchData.lat,
        long: searchData.long,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, try to get text
        const text = await response.text().catch(() => '');
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Backend response data:', data);

    // Backend returns array of CSV records, map them to Property interface
    if (Array.isArray(data)) {
      if (data.length === 0) {
        console.warn('Backend returned empty array');
        return [];
      }
      const mapped = data.map((record, index) => mapBackendRecordToProperty(record, index));
      console.log('Mapped properties:', mapped);
      return mapped;
    }

    console.warn('Backend response is not an array:', data);
    return [];
  } catch (error) {
    console.error('Error searching properties:', error);
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to search properties: ${String(error)}`);
  }
}



export interface Match {
  id: number;
  match_name: string;
  group: string;
  date: string;
  city: string;
  stadium_name: string;
  lat: number;
  long: number;
}

/**
 * Fetch list of FIFA World Cup matches
 */
export async function getMatches(): Promise<Match[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/matches`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}


/**
 * Get property details by ID
 */
export async function getPropertyById(id: string): Promise<Property> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
}

