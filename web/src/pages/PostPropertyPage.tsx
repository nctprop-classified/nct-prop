import React, { useState } from 'react';
import { 
  Building2, Upload, MapPin, IndianRupee, Image as ImageIcon, 
  CheckCircle, ArrowRight, ArrowLeft, Loader2, X, ShieldCheck 
} from 'lucide-react';
import { DELHI_NCR_CITIES, getLocalitiesByCity, formatPriceINR } from '@nctprop/shared';
import { useAuth } from '../lib/auth';
import { createListing, compressAndUploadImage } from '../lib/api';

interface PostPropertyPageProps {
  onNavigate: (page: string, params?: any) => void;
  onSuccess: (id: string) => void;
}

export const PostPropertyPage: React.FC<PostPropertyPageProps> = ({ onNavigate, onSuccess }) => {
  const { user, loginWithPhone, getAuthHeaders } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [type, setType] = useState<'rent' | 'sale'>('rent');
  const [category, setCategory] = useState<'residential' | 'commercial' | 'plot' | 'pg'>('residential');
  const [postedBy, setPostedBy] = useState<'owner' | 'agent' | 'builder'>(user?.user_type || 'owner');
  
  // Location
  const [city, setCity] = useState('Noida');
  const [locality, setLocality] = useState('');
  const [society, setSociety] = useState('');
  const [address, setAddress] = useState('');

  // Specs
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [maintenance, setMaintenance] = useState<number | ''>(0);
  const [areaSqft, setAreaSqft] = useState<number | ''>('');
  const [bedrooms, setBedrooms] = useState<number | ''>(2);
  const [bathrooms, setBathrooms] = useState<number | ''>(2);
  const [furnishing, setFurnishing] = useState<'unfurnished' | 'semi-furnished' | 'fully-furnished'>('semi-furnished');
  const [floorNumber, setFloorNumber] = useState<number | ''>('');
  const [totalFloors, setTotalFloors] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  // Photos & Compression
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; key: string; originalSize: number; compressedSize: number }>>([]);
  const [uploading, setUploading] = useState(false);

  // Contact
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone ? user.phone.replace(/^91/, '') : '');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const localities = getLocalitiesByCity(city);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setErrorMessage('');

    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) {
      setErrorMessage('You have already reached the maximum limit of 5 photos for this listing.');
      return;
    }

    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > remainingSlots) {
      setErrorMessage(`Only ${remainingSlots} more photo(s) can be added (Maximum 5 photos per listing).`);
    }

    const filesToUpload = selectedFiles.slice(0, remainingSlots);
    setUploading(true);

    try {
      for (const file of filesToUpload) {
        const originalSize = file.size;
        // Client-side WebP compression (< 300KB)
        const uploadResult = await compressAndUploadImage(file, undefined, getAuthHeaders());
        setUploadedImages((prev) => [
          ...prev,
          {
            url: uploadResult.url,
            key: uploadResult.key,
            originalSize,
            compressedSize: Math.round(originalSize * 0.15)
          }
        ]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset input value so same files can be re-selected if deleted
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone || contactPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number for WhatsApp inquiries.');
      return;
    }

    if (!user) {
      loginWithPhone(contactPhone, contactName || 'Property Owner');
    }

    setSubmitting(true);
    setErrorMessage('');

    const payload = {
      type,
      category,
      posted_by: postedBy,
      title: title || `${bedrooms ? `${bedrooms} BHK ` : ''}${category.toUpperCase()} in ${locality || society || city}`,
      description,
      price: Number(price),
      maintenance: Number(maintenance) || 0,
      area_sqft: Number(areaSqft),
      bedrooms: bedrooms !== '' ? Number(bedrooms) : null,
      bathrooms: bathrooms !== '' ? Number(bathrooms) : null,
      furnishing,
      floor_number: floorNumber !== '' ? Number(floorNumber) : null,
      total_floors: totalFloors !== '' ? Number(totalFloors) : null,
      city,
      locality: locality || 'Main Sector',
      society_or_colony: society,
      address,
      phone: `91${contactPhone.replace(/[^0-9]/g, '').slice(-10)}`,
      whatsapp_number: `91${contactPhone.replace(/[^0-9]/g, '').slice(-10)}`,
      contact_name: contactName,
      images: uploadedImages.slice(0, 5).map((img) => img.url)
    };

    try {
      const res = await createListing(payload, undefined, getAuthHeaders());
      if (res.success && res.id) {
        onSuccess(res.id);
      } else {
        setErrorMessage(res.error || 'Failed to publish listing. Please check required fields.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while publishing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Step Indicator Header */}
      <div className="mb-8 text-center space-y-2">
        <span className="inline-flex items-center space-x-1.5 bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded-full border border-brand-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Free • Free Expiry Refresh</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Post Property on NCTprop.com</h1>
        <p className="text-xs text-slate-500">Reach genuine buyers & tenants across Delhi-NCR with direct WhatsApp leads.</p>

        {/* Wizard Steps */}
        <div className="flex items-center justify-center space-x-2 pt-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === step
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow'
                  : currentStep > step
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-8 sm:w-12 h-1 mx-1 rounded ${
                  currentStep > step ? 'bg-emerald-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {/* STEP 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b">Step 1: Property Type & Poster Identity</h2>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">I want to *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('rent')}
                  className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all ${
                    type === 'rent'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  Rent Out My Property
                </button>
                <button
                  type="button"
                  onClick={() => setType('sale')}
                  className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all ${
                    type === 'sale'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  Sell My Property
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'residential', label: 'Residential Flat / Floor' },
                  { id: 'commercial', label: 'Commercial / Shop' },
                  { id: 'plot', label: 'Plot / Land' },
                  { id: 'pg', label: 'PG / Co-Living' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id as any)}
                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                      category === c.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* You are posting as */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">You are posting as *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'owner', label: 'Property Owner (0 Brokerage)' },
                  { id: 'agent', label: 'Real Estate Agent / Broker' },
                  { id: 'builder', label: 'Builder / Developer' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPostedBy(p.id as any)}
                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      postedBy === p.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow"
              >
                <span>Next: Location Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b">Step 2: Delhi-NCR Location</h2>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City / Region *</label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setLocality('');
                }}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
              >
                {DELHI_NCR_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.displayName}</option>
                ))}
              </select>
            </div>

            {/* Locality / Sector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sector / Locality *</label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
              >
                <option value="">Select Locality / Sector</option>
                {localities.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Society / Colony */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Society Name / Colony / Landmark</label>
              <input
                type="text"
                placeholder="e.g. ATS Greens, DLF Phase 3, Gaur City 2, etc."
                value={society}
                onChange={(e) => setSociety(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Address / Landmark (Optional)</label>
              <input
                type="text"
                placeholder="Near Metro Station, Market Road, etc."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!locality}
                onClick={() => setCurrentStep(3)}
                className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow disabled:opacity-40"
              >
                <span>Next: Specs & Price</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Specs & Price */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b">Step 3: Property Details & Price</h2>

            {/* Price & Maintenance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {type === 'rent' ? 'Monthly Rent (₹) *' : 'Total Expected Price (₹) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    placeholder={type === 'rent' ? '25000' : '8500000'}
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>
                {price && (
                  <p className="text-[11px] text-brand-600 font-semibold mt-1">
                    {formatPriceINR(Number(price))}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Maintenance (₹)</label>
                <input
                  type="number"
                  placeholder="0 (if included)"
                  value={maintenance}
                  onChange={(e) => setMaintenance(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Area & BHK */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Super Built-up Area (sq.ft) *</label>
                <input
                  type="number"
                  required
                  placeholder="1200"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              {category === 'residential' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms (BHK)</label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                    >
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                      <option value="5">5+ BHK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Furnishing */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Furnishing Status</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'unfurnished', label: 'Unfurnished' },
                  { id: 'semi-furnished', label: 'Semi-Furnished' },
                  { id: 'fully-furnished', label: 'Fully-Furnished' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFurnishing(f.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      furnishing === f.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Listing Headline *</label>
              <input
                type="text"
                placeholder="e.g. Direct Owner 2 BHK Flat with Modular Kitchen in Sector 62"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                rows={3}
                placeholder="Mention key highlights: park facing, near metro, gated society, power backup, parking details, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!price || !areaSqft}
                onClick={() => setCurrentStep(4)}
                className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow disabled:opacity-40"
              >
                <span>Next: Photos & Contact</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Photos, Contact & Submit */}
        {currentStep === 4 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b">Step 4: Photos & WhatsApp Contact</h2>

            {/* Photos upload with client-side compression */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Property Photos ({uploadedImages.length}/5)
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    uploadedImages.length === 5 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {uploadedImages.length === 5 ? 'Max 5 reached' : `${5 - uploadedImages.length} slots left`}
                  </span>
                </div>
                <span className="text-[11px] text-brand-600 font-semibold">WebP Auto-Compression Active</span>
              </div>

              <p className="text-[11px] text-slate-500 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <strong>Recommended 5 photos:</strong> 1 Living Room, 1-2 Bedrooms, 1 Modular Kitchen, 1 Bathroom, 1 Balcony/Exterior view.
              </p>

              {/* Upload Dropzone */}
              {uploadedImages.length < 5 ? (
                <label className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-brand-50/40 transition-colors">
                  {uploading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                      <span className="text-xs font-semibold text-slate-600">Compressing to WebP & Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-slate-700">Click to upload photos ({5 - uploadedImages.length} remaining)</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP automatically optimized</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                  <span className="font-bold">✓ Maximum 5 photos added for this listing (Free tier limit)</span>
                  <span className="text-[11px] text-emerald-600">Remove an image below if you want to replace it</span>
                </div>
              )}

              {/* Uploaded Previews Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-video-card bg-slate-100 border border-slate-200">
                      <img src={img.url} alt="upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-slate-900/80 hover:bg-rose-600 text-white p-1 rounded-full"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Contact Details for Inquiries</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (WhatsApp Enabled) *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm font-semibold bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-r-xl text-sm font-semibold"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Buyers will be able to message you directly on this WhatsApp number.
                </p>
              </div>
            </div>

            {/* Final Publish Button */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Publish Free Property</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
