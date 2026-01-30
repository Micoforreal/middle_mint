'use client';
import React from "react";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { ListChecks, AlertTriangle } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";

const Post = () => {
    const router = useRouter();
    const { publicKey } = useWallet();

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        category: "Dev",
        budget: "",
        description: "",
        requirements: "",
    });


    //Form Handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }


    const handleSubmitted = async () => {
        if (!publicKey) return alert("Please connect your wallet");
        if (!formData.title || !formData.budget) return alert("Please provide the title and budget");
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    budget: parseFloat(formData.budget),
                    description: formData.description,
                    requirements: formData.requirements,
                    client_wallet: publicKey.toString(),
                    client_name: `client_${publicKey.toString().slice(0, 6)}`,
                    status: 'open',
                }),
            });

            if (!response.ok) throw new Error('Failed to post job');

            alert("Job posted successfully!");
            router.push('/dashboard');

        } catch (error: any) {
            console.error("Error", error);
            alert("Error posting job: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative-z-10">
                <h1 className="font-bold text-4xl text-white mb-8 tracking-tight text-start">
                    Create a New Job
                </h1>

                {/* Form */}
                <div className="bg-[#1a1b23] border border-white/5 p-8 rounded-xl space-y-6">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 text-start" htmlFor="title">Gig Title</label>
                        <input
                            type="text"
                            className="w-full bg-[#0f1014] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#9945FF] outline-none transition-all"
                            name="title"
                            placeholder="I want you to ..."
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Category and price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 text-start" htmlFor="category">Category</label>
                            <select
                                name="category"
                                className="w-full bg-[#0f1014] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#9945FF] outline-none px-[7px]"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="Dev">Developer</option>
                                <option value="Smart Contract">Smart contract</option>
                                <option value="Writing">Writing</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Design">Designer</option>
                                <option value="Audit">Audit</option>
                            </select>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="text-start block text-sm font-medium text-gray-400 mb-2">Price (USDC)</label>
                            <div className="relative">
                                <input
                                    name="budget"
                                    type="number"
                                    placeholder="500"
                                    className="w-full bg-[#0f1014] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#9945FF] outline-none"
                                    value={formData.budget}
                                    onChange={handleChange}
                                />
                                <span className="absolute right-4 top-3.5 text-gray-500 text-sm font-bold">USDC</span>
                            </div>
                        </div>
                    </div>



                    {/* Description */}
                    <div>
                        <label className="text-start block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea
                            name="description"
                            className="w-full h-32 bg-[#0f1014] border border-gray-700 rounded-lg p-4 text-white focus:border-[#9945FF] outline-none"
                            placeholder="Describe exactly what the job is about..."
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* THE SILENT PROTOCOL: Application Requirements */}
                    <div className="bg-[#9945FF]/5 border border-[#9945FF]/20 p-6 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <ListChecks className="w-5 h-5 text-[#9945FF]" />
                            <label className="block text-sm font-bold text-white">Application Requirements</label>
                        </div>
                        <p className="text-xs text-gray-400 mb-4 flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 mt-0.5 text-yellow-500" />
                            Since there is no chat before hiring, what MUST the freelancer provide when applying?
                        </p>
                        <textarea
                            name="requirements"
                            className="w-full h-24 bg-[#0f1014] border border-gray-700 rounded-lg p-4 text-white focus:border-[#9945FF] outline-none placeholder:text-gray-600"
                            placeholder="- Link to similar past projects&#10;- GitHub profile link&#10;- Estimated time to completion"
                            value={formData.requirements}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            className="w-full bg-[#14F195] hover:bg-[#10c479] text-black font-bold py-6 text-lg rounded-lg transition-all"
                            onClick={handleSubmitted}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Publishing...
                                </span>
                            ) : (
                                "Post Job"
                            )}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Post;