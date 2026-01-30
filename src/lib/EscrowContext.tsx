"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Escrow } from "@/lib/database";

interface EscrowContextType {
    escrows: Escrow[];
    createEscrow: (jobId: string, applicationId: string, clientWallet: string, freelancerWallet: string, amount: number) => Promise<Escrow>;
    fundEscrow: (escrowId: string, txSignature: string) => Promise<Escrow>;
    submitWork: (escrowId: string, workLink: string, proofImageUrl: string) => Promise<Escrow>;
    releaseEscrow: (escrowId: string) => Promise<Escrow>;
    getEscrowsByJob: (jobId: string) => Promise<Escrow[]>;
    getEscrowsByFreelancer: (wallet: string) => Promise<Escrow[]>;
    getEscrowById: (escrowId: string) => Promise<Escrow | null>;
    loading: boolean;
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

export function EscrowProvider({ children }: { children: React.ReactNode }) {
    const [escrows, setEscrows] = useState<Escrow[]>([]);
    const [loading, setLoading] = useState(true);

    // Load escrows on mount
    useEffect(() => {
        const loadEscrows = async () => {
            try {
                const response = await fetch('/api/escrows');
                const data = await response.json();
                setEscrows(data);
            } catch (error) {
                console.error("Error loading escrows:", error);
            } finally {
                setLoading(false);
            }
        };
        loadEscrows();
    }, []);

    const createEscrow = useCallback(
        async (jobId: string, applicationId: string, clientWallet: string, freelancerWallet: string, amount: number) => {
            try {
                const response = await fetch('/api/escrows', {
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
                const escrow = await response.json();
                setEscrows((prev) => [...prev, escrow]);
                return escrow;
            } catch (error) {
                console.error("Error creating escrow:", error);
                throw error;
            }
        },
        []
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

    return (
        <EscrowContext.Provider
            value={{
                escrows,
                loading,
                createEscrow,
                fundEscrow,
                submitWork,
                releaseEscrow,
                getEscrowsByJob,
                getEscrowsByFreelancer,
                getEscrowById,
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
