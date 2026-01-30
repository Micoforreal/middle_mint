'use client';
import React from 'react';
import Link from 'next/link';
import GigCard from '@/components/GigCard'; // Check spelling: GigCard, not Gigcard
import { Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (response.ok) {
          const data = await response.json();
          setJobs(data.slice(0, 4)); // Show first 4 as trending
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [])

  return (
    <div className="min-h-screen">

      {/* HERO SECTION */}
      <div className="relative overflow-hidden border-b border-white/5">

        {/* LAYER 1: The Background Glow (Empty Div) 
            Notice: It closes immediately </div>. No content inside.
        */}
        <div className="absolute top-0 left-1/2 w-[1000px] h-[400px] bg-[#9945FF]/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        {/* LAYER 2: The Content (Text & Buttons) 
            Notice: 'relative z-10' puts this ON TOP of the glow.
        */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative z-10">

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            The Trustless Bridge for <br />
            <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
              Web3 Work
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Hire top talent or find bounties. Payments are held in secure Solana escrow and only released when the work is done.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/find"
              className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black font-bold px-8 py-4 rounded-lg hover:opacity-90 transition text-lg"
            >
              Find Talent
            </Link>
            <Link
              href="/post"
              className="bg-white/5 text-white border border-white/10 px-8 py-4 rounded-lg hover:bg-white/10 transition text-lg font-medium"
            >
              Post a Gig
            </Link>
          </div>
        </div>
      </div>

      {/* TRENDING SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold text-white">Trending Now</h2>
          <Link href="/find" className="text-[#9945FF] hover:text-[#14F195] transition text-sm font-medium flex items-center gap-1">
            View All <Search className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-gray-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" /> Loading trending jobs...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobs.map((job) => (
              <GigCard
                key={job.id}
                id={job.id}
                category={job.category}
                title={job.title}
                // Display client name
                client={job.client_name}
                budget={job.budget}
              />
            ))}

            {/* Fallback if no jobs exist yet */}
            {jobs.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10 bg-[#1a1b23] rounded-xl border border-white/5">
                <p className="mb-4">No jobs posted yet.</p>
                <Link href="/post" className="text-[#14F195] hover:underline">Be the first to post!</Link>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}