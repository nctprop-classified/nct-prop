import React, { useState, useEffect } from 'react';
import { 
  MapPin, BedDouble, Bath, Maximize2, Building, ShieldCheck, 
  MessageSquare, Phone, Share2, AlertTriangle, ArrowLeft, Check, Sparkles, Eye, Calendar
} from 'lucide-react';
import { Listing, formatPriceINR, buildWhatsAppLink } from '@nctprop/shared';
import { fetchListingById, recordLead } from '../lib/api';
import { AdSlot } from '../components/AdSlot';

interface ListingDetailPageProps {
  id: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({ id, onNavigate }) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Quick inquiry form
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      try {
        const res = await fetchListingById(id);
        if (res.success && res.data) {
          setListing(res.data);
          if (res.data.images && res.data.images.length > 0) {
            setSelectedImage(res.data.images[0].url);
          }
        }
      } catch (err) {
        console.error('Failed to load listing:', err);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="h-8 bg-slate-200 rounded-lg w-2/3" />
          <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Property Not Found</h2>
        <p className="text-slate-500 text-sm">This listing may have expired or been removed by the owner.</p>
        <button
          onClick={() => onNavigate('search')}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm"
        >
          Browse Active Properties
        </button>
      </div>
    );
  }

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80';
  const activeImage = selectedImage || (listing.images && listing.images.length > 0 ? listing.images[0].url : defaultPlaceholder);

  const handleWhatsAppClick = async () => {
    // Record lead in background
    if (buyerPhone) {
      await recordLead({
        listing_id: listing.id,
        buyer_name: buyerName || 'Buyer',
        buyer_phone: buyerPhone
      });
    }
    const link = buildWhatsAppLink(listing.whatsapp_number || listing.phone, listing.title, window.location.href);
    window.open(link, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this property on NCTprop.com: ${listing.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('search', { city: listing.city })}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {listing.city} Properties</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm hover:bg-slate-50"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Main Grid: Gallery + Core Specs vs Contact Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Photos, Details, Specs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Photo Gallery */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm p-2">
            <div className="relative aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden">
              <img
                src={activeImage}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-lg text-white shadow ${
                  listing.type === 'rent' ? 'bg-sky-600' : 'bg-indigo-600'
                }`}>
                  For {listing.type}
                </span>

                {listing.posted_by === 'owner' ? (
                  <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Direct Owner (0 Brokerage)</span>
                  </span>
                ) : (
                  <span className="bg-slate-800/90 text-slate-100 text-xs font-semibold px-2.5 py-1 rounded-lg shadow">
                    Verified Agent
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails row */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex space-x-2 p-2 mt-1 overflow-x-auto">
                {listing.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img.url ? 'border-brand-600 scale-95 shadow' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Basic Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{listing.title}</h1>
                <div className="flex items-center text-xs text-slate-500 mt-1 space-x-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>
                    {listing.society_or_colony ? `${listing.society_or_colony}, ` : ''}
                    {listing.locality}, {listing.city}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="sm:text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {formatPriceINR(listing.price)}
                </span>
                {listing.type === 'rent' && <span className="text-xs text-slate-500 font-semibold"> / month</span>}
                {listing.maintenance ? (
                  <p className="text-[11px] text-slate-400 mt-0.5">+ ₹{listing.maintenance.toLocaleString('en-IN')} Maint.</p>
                ) : null}
              </div>
            </div>

            {/* Key Specs Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 bg-slate-50 rounded-2xl p-4">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Configuration</span>
                <span className="text-sm font-bold text-slate-800">
                  {listing.bedrooms ? `${listing.bedrooms} BHK` : listing.category}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Super Built-up Area</span>
                <span className="text-sm font-bold text-slate-800">{listing.area_sqft} sq.ft</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Furnishing</span>
                <span className="text-sm font-bold text-slate-800 capitalize">{listing.furnishing || 'Unfurnished'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Floor</span>
                <span className="text-sm font-bold text-slate-800">
                  {listing.floor_number !== null ? `${listing.floor_number} of ${listing.total_floors || 4}` : 'Independent'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-slate-900 text-sm">Property Overview & Features</h3>
              <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {listing.description || 'No additional description provided by owner.'}
              </p>
            </div>

            {/* Metadata Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Listed: {new Date(listing.created_at * 1000).toLocaleDateString('en-IN')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{listing.views_count} Views</span>
              </span>
            </div>
          </div>

          {/* AdSense In-Detail Slot */}
          <AdSlot slotId="listing-detail-banner" />

          {/* Safe Deal Guidelines for Delhi-NCR */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-900 block">NCTprop Safety Advisory:</span>
              <p className="text-amber-800">
                Never transfer token money, security deposit, or visiting fees via UPI/IMPS before physically inspecting the property and meeting the owner or authorized broker.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Instant Contact Sidebar */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md sticky top-24 space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Listed By</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{listing.user_name || 'Property Owner'}</h3>
              <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                listing.posted_by === 'owner' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {listing.posted_by === 'owner' ? 'Direct Owner' : 'Real Estate Agent'}
              </span>
            </div>

            {/* Primary Action: Direct WhatsApp */}
            <div className="space-y-2">
              <button
                onClick={handleWhatsAppClick}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Chat Directly on WhatsApp</span>
              </button>

              <a
                href={`tel:+${listing.phone.replace(/[^0-9]/g, '')}`}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all"
              >
                <Phone className="w-4 h-4 text-slate-600" />
                <span>Call {listing.phone}</span>
              </a>
            </div>

            {/* Quick Inquiry Form */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-700">Request Callback</h4>
              {inquirySent ? (
                <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl font-medium">
                  Thank you! The property contact has received your inquiry.
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  <input
                    type="tel"
                    placeholder="Your Phone Number"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  <button
                    onClick={async () => {
                      if (!buyerPhone) return alert('Please enter phone number');
                      await recordLead({
                        listing_id: listing.id,
                        buyer_name: buyerName || 'Buyer',
                        buyer_phone: buyerPhone
                      });
                      setInquirySent(true);
                    }}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl"
                  >
                    Send Callback Request
                  </button>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>100% Free Service • No Hidden Commission</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
