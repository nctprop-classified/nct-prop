import React from 'react';
import { MessageSquare, Phone, MapPin, BedDouble, Bath, Maximize2, ShieldCheck, Sparkles } from 'lucide-react';
import { Listing, formatPriceINR, buildWhatsAppLink } from '@nctprop/shared';

interface PropertyCardProps {
  listing: Listing & { cover_image?: string };
  onClick: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ listing, onClick }) => {
  const coverImage = listing.cover_image || 
    (listing.images && listing.images.length > 0 ? listing.images[0].url : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80');

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = buildWhatsAppLink(listing.whatsapp_number || listing.phone, listing.title);
    window.open(link, '_blank');
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:+${listing.phone.replace(/[^0-9]/g, '')}`;
  };

  return (
    <div
      onClick={() => onClick(listing.id)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-500/40 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-video-card bg-slate-100 overflow-hidden">
        <img
          src={coverImage}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {/* Rent/Sale Badge */}
          <span className={`text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md shadow-sm ${
            listing.type === 'rent' ? 'bg-sky-600 text-white' : 'bg-indigo-600 text-white'
          }`}>
            For {listing.type}
          </span>

          {/* Owner vs Agent Badge */}
          {listing.posted_by === 'owner' ? (
            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Direct Owner (0 Brokerage)</span>
            </span>
          ) : (
            <span className="bg-slate-800/85 text-slate-100 text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm">
              Verified Agent
            </span>
          )}

          {listing.featured ? (
            <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Featured</span>
            </span>
          ) : null}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-md">
          <span className="text-base font-extrabold">{formatPriceINR(listing.price)}</span>
          {listing.type === 'rent' && <span className="text-xs text-slate-300 font-normal"> / mo</span>}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 group-hover:text-brand-600 transition-colors">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-xs text-slate-500 mt-2 space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{listing.locality}, {listing.city}</span>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-slate-700 text-xs">
            {listing.bedrooms ? (
              <div className="flex items-center space-x-1 font-semibold">
                <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                <span>{listing.bedrooms} BHK</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 font-semibold capitalize text-slate-500">
                <span>{listing.category}</span>
              </div>
            )}

            <div className="flex items-center space-x-1 font-semibold">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{listing.area_sqft} sq.ft</span>
            </div>

            {listing.bathrooms ? (
              <div className="flex items-center space-x-1 font-semibold">
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                <span>{listing.bathrooms} Bath</span>
              </div>
            ) : (
              <span className="text-slate-400 text-[11px] capitalize truncate">{listing.furnishing || 'Standard'}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2">
          {/* WhatsApp Direct Connect */}
          <button
            onClick={handleWhatsAppClick}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-white" />
            <span>Chat on WhatsApp</span>
          </button>

          {/* Phone Call */}
          <button
            onClick={handlePhoneClick}
            title="Call"
            className="p-2 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors"
          >
            <Phone className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
