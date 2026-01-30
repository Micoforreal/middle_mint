import { NextRequest, NextResponse } from "next/server";
import { escrowsDb, Escrow } from "@/lib/database";
import { seedDatabase } from "@/lib/seed";

let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    try {
      seedDatabase();
      initialized = true;
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
}

export async function GET(request: NextRequest) {
  ensureInitialized();

  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");
    const freelancerWallet = searchParams.get("freelancerWallet");
    const clientWallet = searchParams.get("clientWallet");

    if (jobId) {
      const escrows = escrowsDb.getByJob(jobId);
      return NextResponse.json(escrows);
    }

    if (freelancerWallet) {
      const escrows = escrowsDb.getByFreelancer(freelancerWallet);
      return NextResponse.json(escrows);
    }

    if (clientWallet) {
      const escrows = escrowsDb.getByClient(clientWallet);
      return NextResponse.json(escrows);
    }

    const escrows = escrowsDb.getAll();
    return NextResponse.json(escrows);
  } catch (error) {
    console.error("Error fetching escrows:", error);
    return NextResponse.json(
      { error: "Failed to fetch escrows" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  ensureInitialized();

  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const escrow = escrowsDb.create({
      id:
        body.id ||
        `escrow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      job_id: body.jobId,
      application_id: body.applicationId,
      client_wallet: body.clientWallet,
      freelancer_wallet: body.freelancerWallet,
      amount: body.amount,
      status: "pending",
      transaction_signature: null,
      work_submission_link: null,
      work_submission_proof: null,
      funded_at: null,
      released_at: null,
      created_at: now,
      updated_at: now,
    });
    return NextResponse.json(escrow, { status: 201 });
  } catch (error) {
    console.error("Error creating escrow:", error);
    return NextResponse.json(
      { error: "Failed to create escrow" },
      { status: 500 },
    );
  }
}
