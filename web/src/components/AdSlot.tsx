import React from 'react';

interface AdSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slotId = 'default', format = 'horizontal', className = '' }) => {
  return (
    <div className={`my-6 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-100/70 border border-dashed border-slate-300 text-center ${className}`}>
      <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400 mb-1">Advertisement</span>
      <div className="w-full max-w-2xl h-20 sm:h-24 bg-white/60 rounded-lg flex items-center justify-center border border-slate-200/60 text-slate-400 text-xs font-medium">
        AdSense Responsive Slot ({slotId})
      </div>
    </div>
  );
};
