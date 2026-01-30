import { NextRequest, NextResponse } from "next/server";
import { applicationsDb, Application } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");
    const freelancerWallet = searchParams.get("freelancerWallet");

    if (jobId) {
      const apps = applicationsDb.getByJob(jobId);
      return NextResponse.json(apps);
    }

    if (freelancerWallet) {
      const apps = applicationsDb.getByFreelancer(freelancerWallet);
      return NextResponse.json(apps);
    }

    const apps = applicationsDb.getAll();
    return NextResponse.json(apps);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const app = applicationsDb.create({
      id:
        body.id ||
        `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      job_id: body.jobId,
      freelancer_wallet: body.freelancerWallet,
      freelancer_name: body.freelancerName,
      cover_letter: body.coverLetter,
      requirements_response: body.requirementsResponse,
      status: body.status || "pending",
      created_at: now,
      updated_at: now,
    });
    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 },
    );
  }
}
