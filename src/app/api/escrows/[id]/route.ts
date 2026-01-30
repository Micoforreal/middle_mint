import { NextRequest, NextResponse } from "next/server";
import { escrowsDb } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const escrow = await escrowsDb.getById(id);
    if (!escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }
    return NextResponse.json(escrow);
  } catch (error) {
    console.error("Error fetching escrow:", error);
    return NextResponse.json(
      { error: "Failed to fetch escrow" },
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
    const escrow = await escrowsDb.update(id, body);
    if (!escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }
    return NextResponse.json(escrow);
  } catch (error) {
    console.error("Error updating escrow:", error);
    return NextResponse.json(
      { error: "Failed to update escrow" },
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
    await escrowsDb.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting escrow:", error);
    return NextResponse.json(
      { error: "Failed to delete escrow" },
      { status: 500 },
    );
  }
}
