import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Code2, Palette, FileText, Megaphone } from 'lucide-react';

// 1. Define the Shape of Data (The Interface)
// This forces you to pass the correct data when you use <GigCard />
interface GigCardProps {
  id: string;
  title: string;
  freelancer: string;
  price: number;
  // We restrict categories to specific strings so we can match icons to them
  category: 'Dev' | 'Design' | 'Audit' | 'Marketing' | 'Commmunity Management';
}

export default function GigCard({ id, title, freelancer, price, category }: GigCardProps) {
  
  // 2. Dynamic Styling Logic
  // Instead of writing a huge "if/else" inside the JSX, we prepare variables here.
  let Icon = Code2;
  let colorClass = "text-gray-400";
  
  if (category === 'Dev') { Icon = Code2; colorClass = "text-[#14F195]"; }
  if (category === 'Design') { Icon = Palette; colorClass = "text-[#9945FF]"; }
  if (category === 'Audit') { Icon = FileText; colorClass = "text-blue-400"; }
  if (category === 'Marketing') { Icon = Megaphone; colorClass = "text-yellow-400"; }

  return (
    // 3. The Link Wrapper
    // We wrap the whole card in a Link so the entire area is clickable.
    <Link href={`/gig/${id}`} className="block group">
      <div className="bg-[#1a1b23] border border-white/5 rounded-xl overflow-hidden hover:translate-y-[-4px] transition duration-300">
        
        {/* Thumbnail Area (Top Half) */}
        <div className="h-40 bg-[#1e1e24] relative flex items-center justify-center">
          {/* The Icon scales up when you hover the group (card) */}
          <div className={`transition duration-300 group-hover:scale-110 ${colorClass}`}>
            <Icon className="w-12 h-12" />
          </div>
          {/* Category Badge */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
            {category}
          </div>
        </div>

        {/* Content Area (Bottom Half) */}
        <div className="p-5">
          {/* Freelancer Handle */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gray-600"></div>
            <span className="text-xs text-gray-400">@{freelancer}</span>
          </div>
          
          {/* Gig Title */}
          <h3 className="font-semibold text-white mb-4 leading-snug min-h-[3rem]">
            {title}
          </h3>
          
          {/* Price & Trust Signal */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-1 text-[#14F195]">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-xs font-medium">Escrow</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-white">{price} USDC</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}