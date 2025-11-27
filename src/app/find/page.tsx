'use client';
import React, { Component } from 'react'
import Navbar from '@/components/Navbar';
import GigCard from '@/components/GigCard';
import { Button } from '@/components/ui/button';
import { Search , Loader2} from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase';

// const GIGS = [
//   { id: '1', title: 'Discord Community Management', budget: 700, category: 'Marketing', client: 'shaxxy_baraka' },
//   { id: '2', title: 'Middlemint code audit', budget: 1000, category: 'Dev', client: 'detrapboi' },
//   { id: '3', title: 'Telegram Community Management', budget: 500, category: 'Marketing', client: 'alex_wuff' },
//   { id: '4', title: 'wuff brand design', budget: 400, category: 'Design', client: '200_men' },
//   { id: '5', title: 'Backend developer', budget: 1000, category: 'Dev', client: 'busha' },
//   { id: '6', title: 'Tokenomics and white paper audit', budget: 1000, category: 'Audit', client: 'telq_sir' },
// ] as const

export default function Find() {
    const [query, setQuery] = useState ("");
    const [jobs, setJobs] = useState<any []>([]);
    const [loading, setLoading] = useState(true);

    useEffect (() => {
      const  fetchJobs = async () =>{
        try{
          const {data, error} = await supabase
          .from('jobs')
          .select('*')
          .order('created_at',{ascending: false});

          if (error) throw error;
          setJobs(data || []);
        } catch (error) {
          console.error ("error fecthing",error);
        } finally{
          setLoading(false);
        }
        }

        fetchJobs ();
      },[]);


    return (
      <div className='min-h-screen'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10'>
            {/* The Find page and Search bar */}
            <h1 className='text-4xl font-bold text-white mb-8'>
                Find Web3 Talent
            </h1><br />
            {/* search bar */}
            <div className='relative'>
                <Search className='absolute left-3 top-3.5 w-5 h-5 text-gray-500' />
                <input type="text"
                placeholder='Search by title'
                className="w-full bg-[#1a1b23] border border-gray-700 rounded-lg pl-10 p-3 text-white focus:border-[#14F195] outline-none transition-all"

                value={query}
                onChange={(e)=> setQuery(e.target.value)}
                />
            </div>
        </div>

        {/* Gigs result */}
     <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20'>
        {loading ? (
          <div className="flex justify-center py-20 text-gray-500 gap-2">
             <Loader2 className="w-6 h-6 animate-spin" /> Loading jobs...
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {jobs
              .filter((job) => job.title.toLowerCase().includes(query.toLowerCase()))
              .map((job) => (
                <GigCard 
                  key={job.id}
                  id={job.id}
                  category={job.category}
                  title={job.title}
                  // Truncate wallet address for display
                  client={job.client_wallet.slice(0, 4) + '...' + job.client_wallet.slice(-4)}
                  budget={job.budget}
                />
              ))
            }
            {jobs.length === 0 && <p className="text-gray-500">No jobs found.</p>}
          </div>
        )}
      </div>

      </div>
    )
  }