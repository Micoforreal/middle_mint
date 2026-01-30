"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Escrow } from "@/lib/database";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { createStreamEscrow, getSolBalance, hasEnoughBalance, CONNECTION } from "@/lib/solanaEscrow";

interface StreamflowStream {
    id: string;
    escrow_id: string;
    sender: string;
    recipient: string;
    mint: string;
    amount: number;
    start_time: number;
    end_time: number;
    withdrawn: number;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    transaction_hash: string;
    vestedAmount?: number;
    remainingAmount?: number;
}

interface EscrowContextType {
    escrows: Escrow[];
    streams: StreamflowStream[];
    createEscrow: (jobId: string, applicationId: string, clientWallet: string, freelancerWallet: string, amount: number, durationDays?: number) => Promise<Escrow>;
    fundEscrow: (escrowId: string, txSignature: string) => Promise<Escrow>;
    submitWork: (escrowId: string, workLink: string, proofImageUrl: string) => Promise<Escrow>;
    releaseEscrow: (escrowId: string) => Promise<Escrow>;
    withdrawFromStream: (streamId: string) => Promise<string>;
    getEscrowsByJob: (jobId: string) => Promise<Escrow[]>;
    getEscrowsByFreelancer: (wallet: string) => Promise<Escrow[]>;
    getEscrowById: (escrowId: string) => Promise<Escrow | null>;
    getStreamByEscrowId: (escrowId: string) => Promise<StreamflowStream | null>;
    loading: boolean;
    checkBalance: (wallet: string, amountSOL: number) => Promise<boolean>;
    getSolBalance: (wallet: string) => Promise<number>;
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

export function EscrowProvider({ children }: { children: React.ReactNode }) {
    const { signTransaction, publicKey } = useWallet();
    const [escrows, setEscrows] = useState<Escrow[]>([]);
    const [streams, setStreams] = useState<StreamflowStream[]>([]);
    const [loading, setLoading] = useState(true);

    // Load escrows and streams on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [escrowsRes, streamsRes] = await Promise.all([
                    fetch('/api/escrows'),
                    fetch('/api/streams'),
                ]);
                const escrowsData = await escrowsRes.json();
                const streamsData = await streamsRes.json();
                setEscrows(escrowsData);
                setStreams(streamsData);
            } catch (error) {
                console.error("Error loading escrows and streams:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const createEscrow = useCallback(
        async (jobId: string, applicationId: string, clientWallet: string, freelancerWallet: string, amount: number, durationDays = 30) => {
            try {
                if (!signTransaction || !publicKey) {
                    throw new Error("Wallet not connected");
                }

                // Check balance first
                const hasBalance = await hasEnoughBalance(new PublicKey(clientWallet), amount);
                if (!hasBalance) {
                    throw new Error(`Insufficient balance. Need ${amount + 0.01} SOL (including fees)`);
                }

                // First create the escrow record in database
                const escrowResponse = await fetch('/api/escrows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId,
                        applicationId,
                        clientWallet,
                        freelancerWallet,
                        amount,
                    }),
                });
                const escrow = await escrowResponse.json();

                // Create real Streamflow vesting stream with SOL
                const now = Math.floor(Date.now() / 1000);
                const startTime = now + 60; // Start in 1 minute
                const endTime = startTime + (durationDays * 24 * 60 * 60);
                const amountLamports = Math.floor(amount * 1e9); // Convert SOL to lamports

                console.log("Creating Streamflow stream...", {
                    amount: amount,
                    amountLamports,
                    startTime,
                    endTime,
                    durationDays,
                });

                const streamResult = await createStreamEscrow(
                    {
                        signer: new PublicKey(clientWallet),
                        recipient: new PublicKey(freelancerWallet),
                        amount: amountLamports,
                        startTime,
                        endTime,
                    },
                    signTransaction
                );

                if (!streamResult.success) {
                    throw new Error("Failed to create Streamflow stream");
                }

                // Save stream to backend
                const streamResponse = await fetch('/api/streams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        escrowId: escrow.id,
                        sender: clientWallet,
                        recipient: freelancerWallet,
                        mint: "So11111111111111111111111111111111111111112", // SOL
                        amount: amountLamports,
                        startTime,
                        endTime,
                        transactionHash: streamResult.txId,
                    }),
                });

                const stream = await streamResponse.json();
                setStreams((prev) => [...prev, stream]);

                // Update escrow status to funded
                const fundedEscrow = await fetch(`/api/escrows/${escrow.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'funded',
                        transaction_signature: streamResult.txId,
                    }),
                });
                const updatedEscrow = await fundedEscrow.json();
                setEscrows((prev) => [...prev, updatedEscrow]);

                console.log("✅ Escrow and stream created successfully!");
                return updatedEscrow;
            } catch (error) {
                console.error("Error creating escrow:", error);
                throw error;
            }
        },
        [signTransaction, publicKey]
    );

    const fundEscrow = useCallback(async (escrowId: string, txSignature: string) => {
        try {
            const response = await fetch(`/api/escrows/${escrowId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'funded', transaction_signature: txSignature }),
            });
            const escrow = await response.json();
            setEscrows((prev) => prev.map((e) => (e.id === escrowId ? escrow : e)));
            return escrow;
        } catch (error) {
            console.error("Error funding escrow:", error);
            throw error;
        }
    }, []);

    const submitWork = useCallback(async (escrowId: string, workLink: string, proofImageUrl: string) => {
        try {
            const response = await fetch(`/api/escrows/${escrowId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'work-submitted',
                    work_submission_link: workLink,
                    work_submission_proof: proofImageUrl,
                }),
            });
            const escrow = await response.json();
            setEscrows((prev) => prev.map((e) => (e.id === escrowId ? escrow : e)));
            return escrow;
        } catch (error) {
            console.error("Error submitting work:", error);
            throw error;
        }
    }, []);

    const releaseEscrow = useCallback(async (escrowId: string) => {
        try {
            const response = await fetch(`/api/escrows/${escrowId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'released',
                    released_at: new Date().toISOString(),
                }),
            });
            const escrow = await response.json();
            setEscrows((prev) => prev.map((e) => (e.id === escrowId ? escrow : e)));
            return escrow;
        } catch (error) {
            console.error("Error releasing escrow:", error);
            throw error;
        }
    }, []);

    const getEscrowsByJob = useCallback(async (jobId: string) => {
        try {
            const response = await fetch(`/api/escrows?jobId=${jobId}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching escrows by job:", error);
            return [];
        }
    }, []);

    const getEscrowsByFreelancer = useCallback(async (wallet: string) => {
        try {
            const response = await fetch(`/api/escrows?freelancerWallet=${wallet}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching escrows by freelancer:", error);
            return [];
        }
    }, []);

    const getEscrowById = useCallback(async (escrowId: string) => {
        try {
            const response = await fetch(`/api/escrows/${escrowId}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching escrow:", error);
            return null;
        }
    }, []);

    const withdrawFromStream = useCallback(async (streamId: string) => {
        try {
            if (!signTransaction) throw new Error("Wallet not connected");

            const response = await fetch(`/api/streams/${streamId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'completed',
                }),
            });

            const updatedStream = await response.json();
            setStreams((prev) => prev.map((s) => (s.id === streamId ? updatedStream : s)));
            return streamId;
        } catch (error) {
            console.error("Error withdrawing from stream:", error);
            throw error;
        }
    }, [signTransaction]);

    const getStreamByEscrowId = useCallback(async (escrowId: string) => {
        try {
            const response = await fetch(`/api/streams?escrowId=${escrowId}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching stream:", error);
            return null;
        }
    }, []);

    const checkBalance = useCallback(async (wallet: string, amountSOL: number): Promise<boolean> => {
        try {
            return await hasEnoughBalance(new PublicKey(wallet), amountSOL);
        } catch (error) {
            console.error("Error checking balance:", error);
            return false;
        }
    }, []);

    const getSolBalanceForWallet = useCallback(async (wallet: string): Promise<number> => {
        try {
            return await getSolBalance(new PublicKey(wallet));
        } catch (error) {
            console.error("Error getting SOL balance:", error);
            return 0;
        }
    }, []);

    return (
        <EscrowContext.Provider
            value={{
                escrows,
                streams,
                createEscrow,
                fundEscrow,
                submitWork,
                releaseEscrow,
                withdrawFromStream,
                getEscrowsByJob,
                getEscrowsByFreelancer,
                getEscrowById,
                getStreamByEscrowId,
                loading,
                checkBalance,
                getSolBalance: getSolBalanceForWallet,
            }}
        >
            {children}
        </EscrowContext.Provider>
    );
}

export function useEscrow() {
    const context = useContext(EscrowContext);
    if (!context) {
        throw new Error("useEscrow must be used within EscrowProvider");
    }
    return context;
}
