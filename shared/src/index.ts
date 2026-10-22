export type ListingType = 'rent' | 'sale';
export type PropertyCategory = 'residential' | 'commercial' | 'plot' | 'pg';
export type PostedBy = 'owner' | 'agent' | 'builder';
export type FurnishingStatus = 'unfurnished' | 'semi-furnished' | 'fully-furnished';
export type ListingStatus = 'active' | 'rented' | 'sold' | 'expired';

export interface User {
  id: string; // firebase_uid
  name: string;
  phone: string;
  email?: string | null;
  role: 'user' | 'admin';
  user_type: PostedBy;
  created_at: number;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string; // Cloudflare R2 public URL
  sort_order: number;
}

export interface Listing {
  id: string;
  user_id: string;
  type: ListingType;
  category: PropertyCategory;
  posted_by: PostedBy;
  title: string;
  description: string;
  price: number;
  maintenance?: number;
  area_sqft: number;
  bedrooms?: number | null; // e.g. 1, 2, 3, 4 BHK (null for plots/commercial)
  bathrooms?: number | null;
  furnishing?: FurnishingStatus;
  floor_number?: number | null;
  total_floors?: number | null;
  city: string; // e.g., 'Delhi', 'Noida', 'Gurugram', etc.
  locality: string; // e.g., 'Sector 62', 'Indirapuram', 'DLF Phase 4'
  society_or_colony?: string;
  address?: string;
  phone: string;
  whatsapp_number: string;
  status: ListingStatus;
  featured: boolean;
  views_count: number;
  created_at: number;
  expires_at: number;
  images?: ListingImage[];
  user_name?: string;
}

export interface ListingFilter {
  city?: string;
  locality?: string;
  type?: ListingType;
  category?: PropertyCategory;
  posted_by?: PostedBy;
  bedrooms?: number;
  min_price?: number;
  max_price?: number;
  furnishing?: FurnishingStatus;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: 'recent' | 'price_asc' | 'price_desc';
}

export interface Lead {
  id: string;
  listing_id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_message?: string;
  created_at: number;
}

// Delhi-NCR Canonical Taxonomy (Districts, Cities, Major Localities)
export interface CityConfig {
  name: string;
  displayName: string;
  localities: string[];
}

export const DELHI_NCR_CITIES: CityConfig[] = [
  {
    name: 'Delhi',
    displayName: 'Delhi',
    localities: [
      'Dwarka',
      'Rohini',
      'Vasant Kunj',
      'Saket',
      'Janakpuri',
      'Lajpat Nagar',
      'Greater Kailash (GK)',
      'Hauz Khas',
      'Uttam Nagar',
      'Paschim Vihar',
      'Pitampura',
      'Mayur Vihar',
      'Laxmi Nagar',
      'South Extension',
      'Malviya Nagar',
      'Karol Bagh',
      'Connaught Place',
      'Chattarpur',
      'New Friends Colony',
      'Defence Colony',
      'Shahdara',
      'Model Town',
      'Shalimar Bagh'
    ]
  },
  {
    name: 'Gurugram',
    displayName: 'Gurugram (Gurgaon)',
    localities: [
      'DLF Phase 1',
      'DLF Phase 2',
      'DLF Phase 3',
      'DLF Phase 4',
      'DLF Phase 5',
      'Golf Course Road',
      'Golf Course Extension Road',
      'Cyber City',
      'Sohna Road',
      'Sector 14',
      'Sector 15',
      'Sector 21',
      'Sector 23',
      'Sector 45',
      'Sector 47',
      'Sector 48',
      'Sector 49',
      'Sector 56',
      'Sector 57',
      'Sector 65',
      'Sector 67',
      'Sector 82',
      'Sector 83',
      'Sector 84',
      'Sector 102 (Dwarka Expressway)',
      'Sector 104 (Dwarka Expressway)',
      'New Gurgaon',
      'South City 1 & 2',
      'Sushant Lok 1 & 2',
      'Palam Vihar',
      'MG Road'
    ]
  },
  {
    name: 'Noida',
    displayName: 'Noida',
    localities: [
      'Sector 15',
      'Sector 18 (Atta Market)',
      'Sector 44',
      'Sector 50',
      'Sector 52',
      'Sector 62',
      'Sector 74',
      'Sector 75',
      'Sector 76',
      'Sector 77',
      'Sector 78',
      'Sector 100',
      'Sector 107',
      'Sector 120',
      'Sector 128 (Expressway)',
      'Sector 137 (Expressway)',
      'Sector 143 (Expressway)',
      'Sector 150',
      'Noida Extension / Gaur City',
      'Film City'
    ]
  },
  {
    name: 'Greater Noida',
    displayName: 'Greater Noida',
    localities: [
      'Greater Noida West (Noida Extension)',
      'Pari Chowk',
      'Alpha 1 & 2',
      'Beta 1 & 2',
      'Gamma 1 & 2',
      'Delta 1 & 2',
      'Omega 1 & 2',
      'Knowledge Park 1, 2, 3',
      'Chi & Phi Sectors',
      'Yamuna Expressway'
    ]
  },
  {
    name: 'Ghaziabad',
    displayName: 'Ghaziabad',
    localities: [
      'Indirapuram',
      'Vaishali',
      'Vasundhara',
      'Raj Nagar Extension',
      'Crossings Republik',
      'Kaushambi',
      'Siddharth Vihar',
      'Chander Nagar',
      'Govindpuram'
    ]
  },
  {
    name: 'Faridabad',
    displayName: 'Faridabad',
    localities: [
      'Green Field Colony',
      'Sector 14',
      'Sector 15 & 15A',
      'Sector 16 & 16A',
      'Sector 21C',
      'Sector 28',
      'Sector 31',
      'Neharpar (Greater Faridabad / Sectors 75-89)',
      'Surajkund',
      'NIT 1, 2, 3, 5',
      'Dayal Bagh'
    ]
  }
];

export function getLocalitiesByCity(cityName: string): string[] {
  const city = DELHI_NCR_CITIES.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase() || c.displayName.toLowerCase().includes(cityName.toLowerCase())
  );
  return city ? city.localities : [];
}

export function formatPriceINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')} Lac`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function buildWhatsAppLink(phone: string, listingTitle: string, listingUrl?: string): string {
  const cleanedPhone = phone.replace(/[^0-9]/g, '');
  const targetPhone = cleanedPhone.startsWith('91') ? cleanedPhone : `91${cleanedPhone}`;
  const text = `Hi, I saw your property listing "${listingTitle}" on NCTprop.com (${listingUrl || 'https://nctprop.com'}). Is it still available? I would like more details.`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}
