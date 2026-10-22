import { Hono } from 'hono';
import { Env } from '../types';

export const citiesRoute = new Hono<{ Bindings: Env }>();

export const DELHI_NCR_CITIES_DATA = [
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

citiesRoute.get('/', (c) => {
  return c.json({
    success: true,
    cities: DELHI_NCR_CITIES_DATA
  });
});
