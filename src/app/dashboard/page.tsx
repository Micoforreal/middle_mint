"use client";
import React, { useState } from 'react';
import { Lock, Eye, CheckCircle, AlertCircle } from 'lucide-react';

// 1. Mock Data for CLIENT View (Jobs I Posted)
const CLIENT_ORDERS = [
  { id: 1, title: "Solana SPL Token Mint UI", freelancer: "@alex_rust", price: 150, status: "funded", date: "Nov 24" },
  { id: 2, title: "Premium 3D Assets", freelancer: "@pixel_art", price: 300, status: "review", date: "Submitted 2h ago" },
];

// 2. Mock Data for FREELANCER View (Jobs I'm Working On)
const FREELANCER_GIGS = [
  { id: 101, title: "Discord Community Setup", client: "@dao_leader", price: 400, status: "completed", date: "Oct 12" },
  { id: 102, title: "Rust Smart Contract Audit", client: "@defi_protocol", price: 800, status: "funded", date: "Due Dec 01" },
];

export default function DashboardPage() {
  // State to toggle between tabs
  const [view, setView] = useState<'client' | 'freelancer'>('client');

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-white">My Orders</h1>
        
        <div className="bg-[#1a1b23] p-1 rounded-lg border border-white/10 inline-flex mt-4 md:mt-0">
          <button 
            onClick={() => setView('client')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              view === 'client' 
              ? 'bg-[#9945FF] text-white shadow-lg' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            As Client (Hiring)
          </button>
          <button 
            onClick={() => setView('freelancer')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              view === 'freelancer' 
              ? 'bg-[#14F195] text-black font-bold shadow-lg' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            As Freelancer (Working)
          </button>
        </div>
      </div>

      {/* CLIENT VIEW LIST */}
      {view === 'client' && (
        <div className="space-y-4">
          {CLIENT_ORDERS.map((order) => (
            <OrderCard 
              key={order.id} 
              role="client"
              title={order.title} 
              user={order.freelancer} 
              price={order.price} 
              status={order.status as any}
              date={order.date}
            />
          ))}
          {CLIENT_ORDERS.length === 0 && <p className="text-gray-500">You haven't hired anyone yet.</p>}
        </div>
      )}

      {/* FREELANCER VIEW LIST */}
      {view === 'freelancer' && (
        <div className="space-y-4">
          {FREELANCER_GIGS.map((gig) => (
            <OrderCard 
              key={gig.id} 
              role="freelancer"
              title={gig.title} 
              user={gig.client} 
              price={gig.price} 
              status={gig.status as any}
              date={gig.date}
            />
          ))}
          {FREELANCER_GIGS.length === 0 && <p className="text-gray-500">You have no active gigs.</p>}
        </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENT: Order Card ---
// This handles the visual logic for each row (Status colors, icons, etc.)
function OrderCard({ role, title, user, price, status, date }: { 
  role: 'client' | 'freelancer', 
  title: string, 
  user: string, 
  price: number, 
  status: 'funded' | 'review' | 'completed',
  date: string 
}) {
  
  // Visual Logic based on Status
  let statusConfig = { icon: Lock, color: 'text-gray-400', bg: 'bg-gray-800', text: 'Unknown' };
  
  if (status === 'funded') {
    statusConfig = { icon: Lock, color: 'text-[#14F195]', bg: 'bg-[#14F195]/10 border-[#14F195]/20', text: 'Escrow Funded' };
  } else if (status === 'review') {
    statusConfig = { icon: Eye, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'Review Needed' };
  } else if (status === 'completed') {
    statusConfig = { icon: CheckCircle, color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700', text: 'Settled' };
  }

  const StatusIcon = statusConfig.icon;

  return (
    <div className={`bg-[#1a1b23] border border-white/5 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 hover:border-white/10 transition cursor-pointer ${status === 'completed' ? 'opacity-60' : ''}`}>
      
      {/* Left Info */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className={`w-12 h-12 bg-[#1e1e24] rounded-lg flex items-center justify-center ${statusConfig.color}`}>
          <StatusIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {/* Dynamic Label: "Freelancer: @alex" vs "Client: @dao" */}
            <span>{role === 'client' ? 'Freelancer' : 'Client'}: {user}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span>{date}</span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${statusConfig.bg}`}>
        {status === 'funded' && <div className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse"></div>}
        <span className={`${statusConfig.color} text-sm font-semibold uppercase tracking-wider`}>
          {statusConfig.text}
        </span>
      </div>

      {/* Price / Action */}
      <div className="text-right w-full md:w-auto">
        {status === 'review' && role === 'client' ? (
          <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition">
            Review Work
          </button>
        ) : (
          <div className="text-xl font-bold text-white">{price} USDC</div>
        )}
      </div>

    </div>
  );
}