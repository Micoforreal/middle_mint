import { NextRequest, NextResponse } from "next/server";
import { streamsDb } from "@/lib/database";

/**
 * GET /api/streams
 * Fetch streams by sender, recipient, or all
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sender = searchParams.get("sender");
    const recipient = searchParams.get("recipient");
    const escrowId = searchParams.get("escrowId");

    if (sender) {
      const streams = await streamsDb.getBySender(sender);
      return NextResponse.json(streams);
    }

    if (recipient) {
      const streams = await streamsDb.getByRecipient(recipient);
      return NextResponse.json(streams);
    }

    if (escrowId) {
      const stream = await streamsDb.getByEscrowId(escrowId);
      return NextResponse.json(stream || null);
    }

    const streams = await streamsDb.getAll();
    return NextResponse.json(streams);
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json(
      { error: "Failed to fetch streams" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/streams
 * Create a new Streamflow stream
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const stream = await streamsDb.create({
      id:
        body.id ||
        `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      escrow_id: body.escrowId,
      sender: body.sender,
      recipient: body.recipient,
      mint: body.mint || "So11111111111111111111111111111111111111112", // SOL by default
      amount: body.amount,
      start_time: body.startTime || Math.floor(Date.now() / 1000),
      end_time: body.endTime,
      withdrawn: 0,
      status: "active",
      transaction_hash: body.transactionHash || `tx-${Date.now()}`,
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json(stream, { status: 201 });
  } catch (error) {
    console.error("Error creating stream:", error);
    return NextResponse.json(
      { error: "Failed to create stream" },
      { status: 500 },
    );
  }
}
