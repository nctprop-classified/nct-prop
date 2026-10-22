import imageCompression from 'browser-image-compression';
import { Listing, ListingFilter } from '@nctprop/shared';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export async function fetchCities() {
  const res = await fetch(`${API_BASE}/api/cities`);
  return res.json();
}

export async function fetchListings(filter: ListingFilter = {}) {
  const params = new URLSearchParams();
  if (filter.city) params.set('city', filter.city);
  if (filter.locality) params.set('locality', filter.locality);
  if (filter.type) params.set('type', filter.type);
  if (filter.category) params.set('category', filter.category);
  if (filter.posted_by) params.set('posted_by', filter.posted_by);
  if (filter.bedrooms) params.set('bedrooms', filter.bedrooms.toString());
  if (filter.min_price) params.set('min_price', filter.min_price.toString());
  if (filter.max_price) params.set('max_price', filter.max_price.toString());
  if (filter.featured !== undefined) params.set('featured', filter.featured ? '1' : '0');
  if (filter.page) params.set('page', filter.page.toString());
  if (filter.limit) params.set('limit', filter.limit.toString());
  if (filter.sort) params.set('sort', filter.sort);

  const res = await fetch(`${API_BASE}/api/listings?${params.toString()}`);
  return res.json();
}

export async function fetchListingById(id: string) {
  const res = await fetch(`${API_BASE}/api/listings/${id}`);
  return res.json();
}

export async function createListing(data: any, token?: string, devHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...devHeaders
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/listings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateListingStatus(id: string, payload: { status?: string; action?: string }, token?: string, devHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...devHeaders
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/listings/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteListing(id: string, token?: string, devHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = {
    ...devHeaders
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/listings/${id}`, {
    method: 'DELETE',
    headers
  });
  return res.json();
}

export async function compressAndUploadImage(
  file: File,
  token?: string,
  devHeaders: Record<string, string> = {},
  onProgress?: (progress: number) => void
): Promise<{ url: string; key: string }> {
  // 1. Client-side compression options
  const options = {
    maxSizeMB: 0.3, // Compress to max ~300KB
    maxWidthOrHeight: 1400, // Crisp resolution for desktop & mobile
    useWebWorker: true,
    fileType: 'image/webp'
  };

  const compressedFile = await imageCompression(file, options);

  // 2. Upload via multipart form
  const formData = new FormData();
  formData.append('file', compressedFile, `${Date.now()}.webp`);

  const headers: Record<string, string> = {
    ...devHeaders
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers,
    body: formData
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to upload image');
  }

  return { url: json.url, key: json.key };
}

export async function recordLead(data: { listing_id: string; buyer_name: string; buyer_phone: string; buyer_message?: string }) {
  const res = await fetch(`${API_BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchMyListings(token?: string, devHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...devHeaders };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers
  });
  return res.json();
}
