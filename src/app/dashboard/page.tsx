"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Eye, CheckCircle, Clock, FileText, Loader2, X, User } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/supabase';

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const [view, setView] = useState<'client' | 'freelancer'>('client');
  
  // Data State
  const [clientJobs, setClientJobs] = useState<any[]>([]);
  const [freelancerApps, setFreelancerApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Fetch Dashboard Data
  useEffect(() => {
    if (!publicKey) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const wallet = publicKey.toString();

        // 1. Jobs I Posted
        const { data: myJobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('client_wallet', wallet)
          .order('created_at', { ascending: false });

        if (myJobs) setClientJobs(myJobs);

        // 2. Jobs I Applied To
        const { data: myApps } = await supabase
          .from('applications')
          .select('*, jobs(title, budget)')
          .eq('freelancer_wallet', wallet)
          .order('created_at', { ascending: false });

        if (myApps) setFreelancerApps(myApps);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicKey]);

  // Handler: Fetch Applicants for a Job
  const handleViewApplicants = async (jobId: string) => {
    setSelectedJobId(jobId); // Open Modal
    setLoadingApplicants(true);
    
    try {
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId);
      
      setApplicants(data || []);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleHire = (applicationId: string) => {
      alert(`Hiring logic for application ${applicationId} coming in Phase 4!`);
  }

  if (!publicKey) return <div className="min-h-screen p-20 text-center text-gray-500">Please connect wallet.</div>;

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto relative">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
        <div className="bg-[#1a1b23] p-1 rounded-lg border border-white/10 inline-flex">
          <button 
            onClick={() => setView('client')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'client' ? 'bg-[#9945FF] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Posted Jobs
          </button>
          <button 
            onClick={() => setView('freelancer')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'freelancer' ? 'bg-[#14F195] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            My Applications
          </button>
        </div>
      </div>

      {loading ? <Loader2 className="animate-spin mx-auto text-gray-500"/> : (
        <>
          {/* CLIENT VIEW */}
          {view === 'client' && (
            <div className="space-y-4">
              {clientJobs.map((job) => (
                <div key={job.id} className="bg-[#1a1b23] border border-white/5 p-6 rounded-xl flex justify-between items-center gap-6">
                    <div>
                        <h3 className="font-bold text-white text-lg">{job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Budget: {job.budget} USDC</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span>Status: {job.status}</span>
                        </div>
                    </div>
                    {job.status === 'open' && (
                        <button 
                            onClick={() => handleViewApplicants(job.id)}
                            className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition border border-white/10"
                        >
                            View Applicants
                        </button>
                    )}
                </div>
              ))}
              {clientJobs.length === 0 && <p className="text-gray-500 text-center">No jobs posted.</p>}
            </div>
          )}

          {/* FREELANCER VIEW */}
          {view === 'freelancer' && (
            <div className="space-y-4">
              {freelancerApps.map((app) => (
                <div key={app.id} className="bg-[#1a1b23] border border-white/5 p-6 rounded-xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-white text-lg">{app.jobs?.title || "Unknown Job"}</h3>
                        <div className="text-sm text-gray-400">Applied: {new Date(app.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="px-4 py-2 rounded-full border bg-yellow-500/10 border-yellow-500/20 text-yellow-500 text-sm font-bold">
                        {app.status}
                    </div>
                </div>
              ))}
              {freelancerApps.length === 0 && <p className="text-gray-500 text-center">No applications yet.</p>}
            </div>
          )}
        </>
      )}

      {/* APPLICANTS MODAL */}
      {selectedJobId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1a1b23] border border-white/10 w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Applicants</h2>
                    <button onClick={() => setSelectedJobId(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                </div>

                {loadingApplicants ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto"/></div> : (
                    <div className="space-y-4">
                        {applicants.map((app) => (
                            <div key={app.id} className="bg-[#0f1014] p-4 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                        {app.freelancer_wallet.slice(0, 2)}
                                    </div>
                                    <span className="text-sm text-gray-300 font-mono">@{app.freelancer_wallet.slice(0, 6)}...</span>
                                </div>
                                
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pitch</p>
                                    <p className="text-gray-300 text-sm">{app.cover_letter}</p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Requirements</p>
                                    <p className="text-gray-300 text-sm border-l-2 border-[#9945FF] pl-3">{app.requirements_response}</p>
                                </div>

                                <button 
                                    onClick={() => handleHire(app.id)}
                                    className="w-full bg-[#14F195] hover:bg-[#10c479] text-black font-bold py-2 rounded-lg text-sm"
                                >
                                    Hire This Freelancer
                                </button>
                            </div>
                        ))}
                        {applicants.length === 0 && <p className="text-gray-500 text-center py-4">No applicants yet.</p>}
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
}