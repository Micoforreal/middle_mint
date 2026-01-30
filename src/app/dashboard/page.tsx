"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Eye, CheckCircle, Clock, FileText, Loader2, X, User, ArrowRight, Send, Upload, DollarSign } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEscrow } from '@/lib/EscrowContext';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const { createEscrow, fundEscrow, submitWork, releaseEscrow, escrows, getEscrowsByJob, getEscrowsByFreelancer } = useEscrow();

  const [view, setView] = useState<'client' | 'freelancer'>('client');

  // Data State
  const [clientJobs, setClientJobs] = useState<any[]>([]);
  const [freelancerApps, setFreelancerApps] = useState<any[]>([]);
  const [jobEscrows, setJobEscrows] = useState<any[]>([]);
  const [freelancerEscrows, setFreelancerEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Escrow Flow Modals
  const [selectedAppForEscrow, setSelectedAppForEscrow] = useState<any>(null);
  const [escrowAmount, setEscrowAmount] = useState("");
  const [creatingEscrow, setCreatingEscrow] = useState(false);

  const [fundingEscrow, setFundingEscrow] = useState<string | null>(null);
  const [fundingTx, setFundingTx] = useState("");

  const [submitWorkEscrow, setSubmitWorkEscrow] = useState<string | null>(null);
  const [workLink, setWorkLink] = useState("");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [submittingWork, setSubmittingWork] = useState(false);

  const [releasingEscrow, setReleasingEscrow] = useState<string | null>(null);

  // Fetch Dashboard Data
  useEffect(() => {
    if (!publicKey) return;

    const fetchData = async () => {
      try {
        const wallet = publicKey.toString();

        // 1. Jobs I Posted
        const jobsRes = await fetch(`/api/jobs?clientWallet=${wallet}`);
        const myJobs = jobsRes.ok ? await jobsRes.json() : [];
        setClientJobs(myJobs);

        // 2. Jobs I Applied To
        const appsRes = await fetch(`/api/applications?freelancerWallet=${wallet}`);
        const myApps = appsRes.ok ? await appsRes.json() : [];
        setFreelancerApps(myApps);

        // 3. Escrows for this wallet as client
        const escrowsRes = await fetch(`/api/escrows?clientWallet=${wallet}`);
        const clientEscrows = escrowsRes.ok ? await escrowsRes.json() : [];
        setJobEscrows(clientEscrows);

        // 4. Escrows for this wallet as freelancer
        const freelancerEscrowsRes = await fetch(`/api/escrows?freelancerWallet=${wallet}`);
        const freelancerEscrowsData = freelancerEscrowsRes.ok ? await freelancerEscrowsRes.json() : [];
        setFreelancerEscrows(freelancerEscrowsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [publicKey, escrows]);

  // Handler: Fetch Applicants for a Job
  const handleViewApplicants = async (jobId: string) => {
    setSelectedJobId(jobId);
    setLoadingApplicants(true);

    try {
      const response = await fetch(`/api/applications?jobId=${jobId}`);
      const apps = response.ok ? await response.json() : [];
      setApplicants(apps);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleStartEscrow = async (app: any) => {
    try {
      const jobRes = await fetch(`/api/jobs/${app.job_id}`);
      if (jobRes.ok) {
        const job = await jobRes.json();
        setSelectedAppForEscrow(app);
        setEscrowAmount(job?.budget.toString() || "");
      }
    } catch (error) {
      console.error('Error fetching job:', error);
    }
  };

  const handleCreateEscrow = async () => {
    if (!publicKey || !selectedAppForEscrow || !escrowAmount) {
      alert("Missing required information");
      return;
    }

    setCreatingEscrow(true);
    try {
      const jobRes = await fetch(`/api/jobs/${selectedAppForEscrow.job_id}`);
      const job = jobRes.ok ? await jobRes.json() : null;

      await createEscrow(
        selectedAppForEscrow.job_id,
        selectedAppForEscrow.id,
        publicKey.toString(),
        selectedAppForEscrow.freelancer_wallet,
        parseFloat(escrowAmount)
      );

      // Update application status
      await fetch(`/api/applications/${selectedAppForEscrow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });

      alert("Escrow created successfully! Now you need to deposit funds.");
      setSelectedAppForEscrow(null);
      setEscrowAmount("");
      setSelectedJobId(null);
    } catch (error) {
      console.error("Error creating escrow:", error);
      alert("Error creating escrow");
    } finally {
      setCreatingEscrow(false);
    }
  };

  const handleFundEscrow = async (escrowId: string) => {
    if (!publicKey) return;

    setFundingEscrow(null);
    try {
      // Simulate transaction
      const txSignature = `tx_${Math.random().toString(36).substr(2, 9)}`;
      await fundEscrow(escrowId, txSignature);

      alert("Escrow funded successfully! (Demo mode - Devnet)\nTransaction ID: " + txSignature);
    } catch (error) {
      console.error("Error funding escrow:", error);
      alert("Error funding escrow");
    }
  };

  const handleSubmitWork = async (escrowId: string) => {
    if (!workLink || !proofImageUrl) {
      alert("Please fill in all fields");
      return;
    }

    setSubmittingWork(true);
    try {
      await submitWork(escrowId, workLink, proofImageUrl);
      alert("Work submitted successfully! Waiting for client approval. (Demo mode)");
      setSubmitWorkEscrow(null);
      setWorkLink("");
      setProofImageUrl("");
    } catch (error) {
      console.error("Error submitting work:", error);
      alert("Error submitting work");
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    if (!publicKey) return;

    setReleasingEscrow(null);
    try {
      await releaseEscrow(escrowId);
      alert("Funds released to freelancer successfully! (Demo mode)");
    } catch (error) {
      console.error("Error releasing escrow:", error);
      alert("Error releasing escrow");
    }
  };

  if (!publicKey) return <div className="min-h-screen p-20 text-center text-gray-500">Please connect wallet.</div>;

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto relative">

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
        <div className="bg-[#1a1b23] p-1 rounded-lg border border-white/10 inline-flex">
          <button
            onClick={() => setView('client')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'client' ? 'bg-[#9945FF] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Posted Jobs & Escrows
          </button>
          <button
            onClick={() => setView('freelancer')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'freelancer' ? 'bg-[#14F195] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            My Applications
          </button>
        </div>
      </div>

      {loading ? <Loader2 className="animate-spin mx-auto text-gray-500" /> : (
        <>
          {/* CLIENT VIEW */}
          {view === 'client' && (
            <div className="space-y-6">
              {/* Posted Jobs Section */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">My Posted Jobs</h2>
                <div className="space-y-4">
                  {clientJobs.map((job) => (
                    <div key={job.id} className="bg-[#1a1b23] border border-white/5 p-6 rounded-xl">
                      <div className="flex justify-between items-start gap-6">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-2">
                            <span>Budget: {job.budget} USDC</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span>{job.category}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${job.status === 'open' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
                              {job.status}
                            </span>
                          </div>
                        </div>
                        {job.status === 'open' && (
                          <button
                            onClick={() => handleViewApplicants(job.id)}
                            className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition border border-white/10 whitespace-nowrap"
                          >
                            View Applicants
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {clientJobs.length === 0 && <p className="text-gray-500 text-center">No jobs posted.</p>}
                </div>
              </div>

              {/* Active Escrows Section */}
              {jobEscrows.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Active Escrows</h2>
                  <div className="space-y-4">
                    {jobEscrows.map((escrow) => {
                      const job = clientJobs.find(j => j.id === escrow.job_id);
                      const app = freelancerApps.find(a => a.id === escrow.application_id);

                      return (
                        <div key={escrow.id} className="bg-[#1a1b23] border border-white/5 p-6 rounded-xl">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-bold text-white mb-2">{job?.title}</h3>
                              <div className="space-y-2 text-sm text-gray-400">
                                <p>Freelancer: {app?.freelancer_name}</p>
                                <p>Amount: {escrow.amount} USDC</p>
                                <p className={`font-semibold ${escrow.status === 'released' ? 'text-green-400' :
                                  escrow.status === 'work-submitted' ? 'text-yellow-400' :
                                    escrow.status === 'funded' ? 'text-blue-400' : 'text-gray-400'
                                  }`}>
                                  Status: {escrow.status}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {escrow.status === 'work-submitted' && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg mb-3">
                                  <p className="text-xs text-yellow-200 font-semibold mb-2">Work Submitted for Review:</p>
                                  <p className="text-xs text-gray-300 break-all">{escrow.work_submission_link}</p>
                                  <img src={escrow.work_submission_proof} alt="Work proof" className="w-full h-32 object-cover rounded mt-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                              )}

                              {escrow.status === 'work-submitted' && (
                                <Button
                                  onClick={() => handleReleaseEscrow(escrow.id)}
                                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 text-sm"
                                >
                                  {releasingEscrow === escrow.id ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : "Release Funds to Freelancer"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FREELANCER VIEW */}
          {view === 'freelancer' && (
            <div className="space-y-6">
              {/* Applications Section */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">My Applications</h2>
                <div className="space-y-4">
                  {freelancerApps.map((app) => {
                    const job = clientJobs.find(j => j.id === app.job_id);
                    const escrow = freelancerEscrows.find(e => e.application_id === app.id);

                    return (
                      <div key={app.id} className="bg-[#1a1b23] border border-white/5 p-6 rounded-xl">
                        <div className="flex justify-between items-start gap-6">
                          <div>
                            <h3 className="font-bold text-white text-lg">{job?.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-2">
                              <span>Budget: {job?.budget} USDC</span>
                              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                              <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-full border text-sm font-bold ${app.status === 'accepted' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' :
                            app.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' :
                              app.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                                'bg-gray-500/10 border-gray-500/20 text-gray-300'
                            }`}>
                            {app.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {freelancerApps.length === 0 && <p className="text-gray-500 text-center">No applications yet.</p>}
                </div>
              </div>

              {/* Active Escrows / Work Submission Section */}
              {freelancerEscrows.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Active Contracts & Earnings</h2>
                  <div className="space-y-4">
                    {freelancerEscrows.map((escrow) => {
                      const job = clientJobs.find(j => j.id === escrow.job_id);

                      return (
                        <div key={escrow.id} className="bg-[#1a1b23] border border-white/5 p-6 rounded-xl">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-bold text-white mb-2">{job?.title}</h3>
                              <div className="space-y-2 text-sm text-gray-400">
                                <p>Client: {job?.client_name}</p>
                                <p className="text-lg font-bold text-[#14F195]">Earning: {escrow.amount} USDC</p>
                                <p className={`font-semibold ${escrow.status === 'released' ? 'text-green-400' :
                                  escrow.status === 'work-submitted' ? 'text-yellow-400' :
                                    escrow.status === 'funded' ? 'text-blue-400' : 'text-gray-400'
                                  }`}>
                                  Status: {escrow.status}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {escrow.status === 'pending' && (
                                <p className="text-xs text-gray-400 p-3 bg-gray-500/10 rounded">Waiting for client to fund the escrow...</p>
                              )}

                              {escrow.status === 'funded' && (
                                <>
                                  <p className="text-xs text-green-300 font-semibold mb-2">✓ Funds are now secured in escrow. Ready to start work?</p>
                                  <Button
                                    onClick={() => setSubmitWorkEscrow(escrow.id)}
                                    className="w-full bg-[#9945FF] hover:bg-[#8037e2] text-white font-bold py-2 text-sm"
                                  >
                                    <Upload className="w-4 h-4 mr-2" /> Submit Work
                                  </Button>
                                </>
                              )}

                              {escrow.status === 'work-submitted' && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
                                  <p className="text-xs text-yellow-200 font-semibold">✓ Work submitted! Waiting for client review...</p>
                                </div>
                              )}

                              {escrow.status === 'released' && (
                                <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                                  <p className="text-xs text-green-200 font-semibold">✓ Payment released! Work complete!</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* APPLICANTS MODAL */}
      {selectedJobId && selectedAppForEscrow === null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1b23] border border-white/10 w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Applicants</h2>
              <button onClick={() => setSelectedJobId(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            {loadingApplicants ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></div> : (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <div key={app.id} className="bg-[#0f1014] p-4 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {app.freelancer_wallet.slice(0, 2)}
                      </div>
                      <span className="text-sm text-gray-300 font-mono">@{app.freelancer_name}</span>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pitch</p>
                      <p className="text-gray-300 text-sm">{app.cover_letter}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Requirements</p>
                      <p className="text-gray-300 text-sm border-l-2 border-[#9945FF] pl-3 break-all">{app.requirements_response}</p>
                    </div>

                    <button
                      onClick={() => handleStartEscrow(app)}
                      className="w-full bg-[#14F195] hover:bg-[#10c479] text-black font-bold py-2 rounded-lg text-sm"
                    >
                      {app.status === 'accepted' ? 'Already Hired' : 'Hire & Create Escrow'}
                    </button>
                  </div>
                ))}
                {applicants.length === 0 && <p className="text-gray-500 text-center py-4">No applicants yet.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE ESCROW MODAL */}
      {selectedAppForEscrow && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1b23] border border-white/10 w-full max-w-md rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create Escrow Contract</h2>
              <button onClick={() => setSelectedAppForEscrow(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 font-semibold">Freelancer</label>
                <p className="text-white font-mono text-sm mt-1">@{selectedAppForEscrow.freelancer_name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 font-semibold">Escrow Amount (USDC)</label>
                <input
                  type="number"
                  value={escrowAmount}
                  onChange={(e) => setEscrowAmount(e.target.value)}
                  className="w-full bg-[#0f1014] border border-gray-700 rounded-lg px-4 py-3 text-white mt-2 focus:border-[#14F195] outline-none"
                  placeholder="Enter amount"
                />
              </div>

              <div className="bg-[#14F195]/10 border border-[#14F195]/30 p-4 rounded-lg">
                <p className="text-xs text-gray-300">
                  When you create this escrow, the funds will be locked in a contract. The freelancer can only receive them after work is submitted and you approve it.
                </p>
              </div>

              <Button
                onClick={handleCreateEscrow}
                disabled={creatingEscrow}
                className="w-full bg-[#14F195] hover:bg-[#10c479] text-black font-bold py-3"
              >
                {creatingEscrow ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : "Create Escrow"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT WORK MODAL */}
      {submitWorkEscrow && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1b23] border border-white/10 w-full max-w-md rounded-xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Submit Work</h2>
              <button onClick={() => setSubmitWorkEscrow(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 font-semibold mb-2">Work Link/URL</label>
                <input
                  type="text"
                  value={workLink}
                  onChange={(e) => setWorkLink(e.target.value)}
                  className="w-full bg-[#0f1014] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#14F195] outline-none"
                  placeholder="https://github.com/your-repo or https://your-portfolio.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 font-semibold mb-2">Proof Image URL</label>
                <input
                  type="text"
                  value={proofImageUrl}
                  onChange={(e) => setProofImageUrl(e.target.value)}
                  className="w-full bg-[#0f1014] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#14F195] outline-none"
                  placeholder="https://example.com/screenshot.png"
                />
              </div>

              {proofImageUrl && (
                <img
                  src={proofImageUrl}
                  alt="Work proof preview"
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    alert('Could not load image - make sure URL is valid');
                  }}
                />
              )}

              <Button
                onClick={() => handleSubmitWork(submitWorkEscrow)}
                disabled={submittingWork}
                className="w-full bg-[#14F195] hover:bg-[#10c479] text-black font-bold py-3"
              >
                {submittingWork ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {submittingWork ? "Submitting..." : "Submit Work"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}