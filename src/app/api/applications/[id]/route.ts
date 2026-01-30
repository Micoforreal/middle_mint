import { NextRequest, NextResponse } from "next/server";
import { applicationsDb } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const app = await applicationsDb.getById(id);
    return NextResponse.json(app || { error: "Not found" }, {
      status: app ? 200 : 404,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const app = await applicationsDb.update(id, body);
    return NextResponse.json(app || { error: "Not found" }, {
      status: app ? 200 : 404,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await applicationsDb.delete(id);
    return NextResponse.json({ deleted }, { status: deleted ? 200 : 404 });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 },
    );
  }
}
