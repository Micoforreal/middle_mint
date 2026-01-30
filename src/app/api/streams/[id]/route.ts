import { NextRequest, NextResponse } from "next/server";
import { streamsDb } from "@/lib/database";
import { calculateVestedAmount } from "@/lib/streamflowService";

/**
 * GET /api/streams/[id]
 * Fetch stream details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const stream = streamsDb.getById(id);

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Calculate vested amount
    const vestedAmount = calculateVestedAmount({
      id: stream.id,
      sender: stream.sender as any,
      recipient: stream.recipient as any,
      mint: stream.mint as any,
      amount: stream.amount,
      startTime: stream.start_time,
      endTime: stream.end_time,
      withdrawn: stream.withdrawn,
      status: stream.status,
      transactionHash: stream.transaction_hash,
      createdAt: Math.floor(new Date(stream.created_at).getTime() / 1000),
    });

    return NextResponse.json({
      ...stream,
      vestedAmount,
      remainingAmount: stream.amount - stream.withdrawn,
    });
  } catch (error) {
    console.error("Error fetching stream:", error);
    return NextResponse.json(
      { error: "Failed to fetch stream" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/streams/[id]
 * Update stream (withdraw, cancel, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const stream = streamsDb.update(id, {
      ...body,
      updated_at: new Date().toISOString(),
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    return NextResponse.json(stream);
  } catch (error) {
    console.error("Error updating stream:", error);
    return NextResponse.json(
      { error: "Failed to update stream" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/streams/[id]
 * Delete stream (for cancelled streams)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = streamsDb.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stream:", error);
    return NextResponse.json(
      { error: "Failed to delete stream" },
      { status: 500 },
    );
  }
}
