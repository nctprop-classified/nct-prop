import React, { useState, useEffect } from 'react';
import { Building, PlusCircle, CheckCircle, Trash2, RotateCw, ExternalLink, MessageSquare, AlertCircle } from 'lucide-react';
import { Listing, formatPriceINR } from '@nctprop/shared';
import { useAuth } from '../lib/auth';
import { fetchMyListings, updateListingStatus, deleteListing } from '../lib/api';

interface MyListingsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const MyListingsPage: React.FC<MyListingsPageProps> = ({ onNavigate }) => {
  const { user, getAuthHeaders } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchMyListings(undefined, getAuthHeaders());
      if (res.success) {
        setListings(res.listings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await updateListingStatus(id, { status: newStatus }, undefined, getAuthHeaders());
      if (res.success) {
        setMessage(`Listing marked as ${newStatus}`);
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleRenew = async (id: string) => {
    try {
      const res = await updateListingStatus(id, { action: 'renew' }, undefined, getAuthHeaders());
      if (res.success) {
        setMessage('Listing successfully renewed for 30 days!');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Renewal failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      const res = await deleteListing(id, undefined, getAuthHeaders());
      if (res.success) {
        setMessage('Listing deleted');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Please Sign In</h2>
        <p className="text-slate-500 text-xs">You need to sign in with your mobile number to view and manage your posted listings.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
        >
          Go to Home & Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Property Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <span className="font-semibold text-slate-800">{user.name}</span> (+{user.phone})
          </p>
        </div>

        <button
          onClick={() => onNavigate('post-property')}
          className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Another Property</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-600 text-xs font-bold">Dismiss</button>
        </div>
      )}

      {/* Listings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map((item: any) => {
            const isExpired = item.expires_at * 1000 < Date.now();
            return (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={item.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'rented' ? 'bg-sky-100 text-sky-800' :
                        item.status === 'sold' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                      {isExpired && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Needs Renewal</span>
                        </span>
                      )}
                      <span className="text-xs font-extrabold text-slate-900">{formatPriceINR(item.price)}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-400">{item.locality}, {item.city} • {item.area_sqft} sq.ft</p>
                    <p className="text-[11px] text-slate-400">
                      Expires: {new Date(item.expires_at * 1000).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => onNavigate('listing-detail', { id: item.id })}
                    className="p-2 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1"
                    title="View Listing"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleRenew(item.id)}
                    className="p-2 text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl text-xs font-bold flex items-center space-x-1"
                    title="Renew 30 Days"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Renew (+30d)</span>
                  </button>

                  {item.status === 'active' ? (
                    <button
                      onClick={() => handleStatusChange(item.id, item.type === 'rent' ? 'rented' : 'sold')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      Mark as {item.type === 'rent' ? 'Rented' : 'Sold'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(item.id, 'active')}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold"
                    >
                      Mark Active
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <Building className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">You haven't posted any properties yet</h3>
          <p className="text-xs text-slate-500">Post your residential flat, builder floor, or commercial shop 100% free.</p>
          <button
            onClick={() => onNavigate('post-property')}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow"
          >
            Post Property Now
          </button>
        </div>
      )}

    </div>
  );
};
