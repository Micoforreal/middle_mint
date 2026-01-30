"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, CheckCircle2, ShieldCheck,
    Loader2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';

export default function JobDetailPage() {
    const params = useParams();
    const { publicKey } = useWallet();

    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hasApplied, setHasApplied] = useState(false);

    // Application State
    const [isApplying, setIsApplying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [applicationData, setApplicationData] = useState({
        coverLetter: "",
        requirementsResponse: ""
    });

    // Fetch Job Logic
    useEffect(() => {
        const fetchJob = async () => {
            if (!params.id) return;
            try {
                const response = await fetch(`/api/jobs/${params.id}`);
                if (response.ok) {
                    const job = await response.json();
                    setJob(job);

                    // Check if user already applied
                    if (publicKey) {
                        const appResponse = await fetch(
                            `/api/applications?jobId=${params.id}&freelancerWallet=${publicKey.toString()}`
                        );
                        if (appResponse.ok) {
                            const apps = await appResponse.json();
                            setHasApplied(apps.length > 0);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching job details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [params.id, publicKey]);

    // Handle Application Submit
    const handleApply = async () => {
        if (!publicKey) return alert("Please connect wallet first!");
        if (!applicationData.coverLetter || !applicationData.requirementsResponse) {
            return alert("Please fill in all fields");
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: job.id,
                    freelancerWallet: publicKey.toString(),
                    freelancerName: `freelancer_${publicKey.toString().slice(0, 6)}`,
                    coverLetter: applicationData.coverLetter,
                    requirementsResponse: applicationData.requirementsResponse,
                    status: 'pending',
                }),
            });

            if (!response.ok) throw new Error('Failed to submit application');

            alert("Application Sent! The client will review it.");
            setIsApplying(false);
            setHasApplied(true);
            setApplicationData({ coverLetter: "", requirementsResponse: "" });
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> Loading...</div>;
    if (!job) return <div className="min-h-screen bg-[#0f1014] flex justify-center items-center text-white">Job not found</div>;

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <Link href="/find" className="flex items-center text-gray-400 hover:text-white mb-8 transition text-sm w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* LEFT COLUMN: Job Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{job.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-400 border-y border-white/10 py-4">
                            <span>Client: @{job.client_name}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span>Category: {job.category}</span>
                        </div>
                    </div>

                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <h3 className="text-xl font-semibold text-white">Job Description</h3>
                        <p className="whitespace-pre-wrap">{job.description}</p>

                        {/* Application Requirements Box */}
                        {job.requirements && (
                            <div className="bg-[#1a1b23] p-6 rounded-lg border border-white/10 mt-6">
                                <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Required for Application:</h4>
                                <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed border-l-2 border-[#9945FF] pl-4">
                                    {job.requirements}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Sticky Application Card */}
                <div className="lg:col-span-1 relative">
                    <div className="bg-[#1a1b23] border border-white/5 p-6 rounded-xl sticky top-24">

                        <div className="text-center mb-6">
                            <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Client Budget</span>
                            <div className="mt-2">
                                <span className="text-4xl font-bold text-white">{job.budget}</span>
                                <span className="text-xl text-gray-500 font-bold ml-1">USDC</span>
                            </div>
                        </div>

                        {!publicKey ? (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg flex gap-3 mb-4">
                                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-200">Please connect your wallet to apply</p>
                            </div>
                        ) : hasApplied ? (
                            // STATE: Already Applied
                            <div className="space-y-3">
                                <div className="bg-[#14F195]/10 border border-[#14F195]/30 rounded-lg p-4 flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#14F195] flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-[#14F195] font-semibold">You've already applied for this gig!</p>
                                </div>
                                <Button
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-6 text-lg rounded-lg"
                                    disabled
                                >
                                    Already Applied
                                </Button>
                            </div>
                        ) : !isApplying ? (
                            // STATE 1: "Apply Now" Button
                            <div className="space-y-3">
                                <div className="bg-[#14F195]/5 border border-[#14F195]/20 rounded-lg p-4 mb-6 flex gap-3">
                                    <ShieldCheck className="w-5 h-5 text-[#14F195] flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-300">Payment is <strong>secured in Escrow</strong>.</p>
                                </div>
                                <Button
                                    className="w-full bg-[#14F195] hover:bg-[#10c479] text-black font-bold py-6 text-lg rounded-lg shadow-[0_0_20px_rgba(20,241,149,0.2)]"
                                    onClick={() => setIsApplying(true)}
                                >
                                    Apply Now
                                </Button>
                            </div>
                        ) : (
                            // STATE 2: The Application Form
                            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-white font-bold">Your Pitch</h3>
                                    <button onClick={() => setIsApplying(false)} className="text-xs text-gray-500 hover:text-white">Cancel</button>
                                </div>

                                <textarea
                                    className="w-full h-24 bg-[#0f1014] border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-[#14F195] outline-none"
                                    placeholder="Why are you a good fit?"
                                    value={applicationData.coverLetter}
                                    onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                                ></textarea>

                                <div className="bg-[#9945FF]/10 p-3 rounded border border-[#9945FF]/30">
                                    <label className="block text-xs font-bold text-[#9945FF] mb-2 uppercase">Requirements Response</label>
                                    <input
                                        className="w-full bg-[#0f1014] border border-gray-700 rounded p-2 text-white text-sm focus:border-[#9945FF] outline-none"
                                        placeholder="Paste links/proof here..."
                                        value={applicationData.requirementsResponse}
                                        onChange={(e) => setApplicationData(prev => ({ ...prev, requirementsResponse: e.target.value }))}
                                    />
                                </div>

                                <Button
                                    className="w-full bg-[#14F195] hover:bg-[#10c479] text-black font-bold py-3"
                                    onClick={handleApply}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Submitting...</> : "Submit Application"}
                                </Button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}