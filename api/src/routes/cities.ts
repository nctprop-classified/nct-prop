import { Hono } from 'hono';
import { Env } from '../types';

export const citiesRoute = new Hono<{ Bindings: Env }>();

export const DELHI_NCR_CITIES_DATA = [
  {
    name: 'Delhi',
    displayName: 'Delhi',
    localities: [
      'Chander Vihar (West Delhi / Nilothi)',
      'Chander Vihar (East Delhi / Mandawali)',
      'Dwarka (Sectors 1-29)',
      'Rohini (Sectors 1-38)',
      'Vasant Kunj',
      'Saket',
      'Janakpuri',
      'Lajpat Nagar (I-IV)',
      'Greater Kailash (GK 1 & 2)',
      'Hauz Khas & Green Park',
      'Uttam Nagar (East & West)',
      'Paschim Vihar',
      'Pitampura',
      'Mayur Vihar (Phases 1, 2, 3)',
      'IP Extension & Patparganj',
      'Mandawali',
      'Laxmi Nagar & Shakarpur',
      'Preet Vihar & Nirman Vihar',
      'South Extension (Part 1 & 2)',
      'Malviya Nagar & Shivalik',
      'Karol Bagh & Rajendra Nagar',
      'Connaught Place & Central Delhi',
      'Chattarpur & Mehrauli',
      'New Friends Colony',
      'Defence Colony',
      'Shahdara & Dilshad Garden',
      'Model Town & GTB Nagar',
      'Shalimar Bagh & Ashok Vihar',
      'Punjabi Bagh & Rajouri Garden',
      'Tilak Nagar & Vikaspuri',
      'Burari & Sant Nagar',
      'Civil Lines',
      'Kalkaji & Nehru Place',
      'Govindpuri & CR Park',
      'Sangam Vihar & Deoli',
      'Sarita Vihar & Jasola',
      'Okhla & Jamia Nagar',
      'Najafgarh',
      'Narela & Bawana',
      'Alipur'
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
      'Sector 22 & 23',
      'Sector 31',
      'Sector 45',
      'Sector 46 & 47',
      'Sector 48 & 49',
      'Sector 56 & 57',
      'Sector 65, 66, 67',
      'Sector 69 & 70',
      'Sector 79 & 80',
      'Sector 82, 83, 84',
      'Sector 85 & 86',
      'Sector 89 & 90',
      'Sector 102 (Dwarka Expressway)',
      'Sector 104 (Dwarka Expressway)',
      'Sector 109 & 110 (Dwarka Expressway)',
      'New Gurgaon',
      'South City 1 & 2',
      'Sushant Lok 1, 2, 3',
      'Palam Vihar',
      'MG Road'
    ]
  },
  {
    name: 'Noida',
    displayName: 'Noida',
    localities: [
      'Sector 15 & 16',
      'Sector 18 (Atta Market)',
      'Sector 19, 21, 22',
      'Sector 25, 26, 27',
      'Sector 29 & 37 (Golf Course)',
      'Sector 44 & 45',
      'Sector 50 & 51',
      'Sector 52 & 61',
      'Sector 62 & 63',
      'Sector 70 & 71',
      'Sector 74, 75, 76',
      'Sector 77, 78, 79',
      'Sector 93 & 93A (Expressway)',
      'Sector 100 & 104',
      'Sector 107 & 108',
      'Sector 110 & 119',
      'Sector 120, 121, 122',
      'Sector 128 (Expressway)',
      'Sector 134 & 135 (Expressway)',
      'Sector 137 (Expressway)',
      'Sector 143 & 143B (Expressway)',
      'Sector 150 (Sports City)',
      'Sector 168 (Expressway)',
      'Noida Extension / Gaur City',
      'Film City'
    ]
  },
  {
    name: 'Greater Noida',
    displayName: 'Greater Noida',
    localities: [
      'Greater Noida West (Noida Extension)',
      'Gaur City 1 & 2',
      'Pari Chowk',
      'Alpha 1 & 2',
      'Beta 1 & 2',
      'Gamma 1 & 2',
      'Delta 1, 2, 3',
      'Omega 1 & 2',
      'Knowledge Park 1, 2, 3, 5',
      'Chi & Phi Sectors',
      'Zeta & Eta Sectors',
      'Ecotech (Industrial)',
      'Yamuna Expressway'
    ]
  },
  {
    name: 'Ghaziabad',
    displayName: 'Ghaziabad',
    localities: [
      'Indirapuram',
      'Vaishali (Sectors 1-9)',
      'Vasundhara (Sectors 1-19)',
      'Chander Nagar & Surya Nagar',
      'Raj Nagar Extension',
      'Crossings Republik',
      'Kaushambi',
      'Siddharth Vihar',
      'Govindpuram',
      'Shalimar Garden',
      'Sahibabad',
      'Wave City (NH-24)',
      'Kavi Nagar & Raj Nagar'
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
      'Sector 21A, 21B, 21C',
      'Sector 28 & 29',
      'Sector 30 & 31',
      'Sector 37',
      'Neharpar (Greater Faridabad / Sectors 75-89)',
      'Surajkund & Charmwood Village',
      'NIT 1, 2, 3, 4, 5',
      'Dayal Bagh',
      'Ballabhgarh'
    ]
  }
];

citiesRoute.get('/', (c) => {
  return c.json({
    success: true,
    cities: DELHI_NCR_CITIES_DATA
  });
});
