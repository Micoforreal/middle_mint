import { NextRequest, NextResponse } from "next/server";
import { jobsDb, Job } from "@/lib/database";
import { seedDatabase } from "@/lib/seed";

// Initialize on first request
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
    const clientWallet = searchParams.get("clientWallet");
    const id = searchParams.get("id");

    if (id) {
      const job = jobsDb.getById(id);
      return NextResponse.json(job || { error: "Not found" }, {
        status: job ? 200 : 404,
      });
    }

    if (clientWallet) {
      const jobs = jobsDb.getByClient(clientWallet);
      return NextResponse.json(jobs);
    }

    const jobs = jobsDb.getAll();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  ensureInitialized();

  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const job = jobsDb.create({
      id:
        body.id ||
        `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: body.title,
      description: body.description,
      category: body.category,
      budget: body.budget,
      client_wallet: body.client_wallet,
      client_name: body.client_name,
      requirements: body.requirements,
      status: body.status || "open",
      created_at: now,
      updated_at: now,
    });
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 },
    );
  }
}
