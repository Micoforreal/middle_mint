import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import fs from "fs";
import path from "path";

const CONNECTION = new Connection("https://api.devnet.solana.com", "confirmed");

/**
 * POST /api/escrow/release
 * Releases funds from escrow wallet to freelancer
 *
 * Body: {
 *   freelancerWallet: string,
 *   amountSOL: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { freelancerWallet, amountSOL } = await request.json();

    if (!freelancerWallet || !amountSOL) {
      return NextResponse.json(
        { error: "Missing freelancerWallet or amountSOL" },
        { status: 400 },
      );
    }

    // Load escrow keypair from file
    const keypairB64 = process.env.ESCROW_KEYPAIR_B64;

    if (!keypairB64) {
      return NextResponse.json(
        { error: "ESCROW_KEYPAIR_B64 environment variable not set" },
        { status: 500 }
      );
    }

    // Decode from base64
    const keypairData = JSON.parse(
      Buffer.from(keypairB64, "base64").toString("utf-8")
    );
    const escrowKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

 

    const recipientPublicKey = new PublicKey(freelancerWallet);
    const amountLamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);

    console.log(`\n📝 Escrow Release Request:`);
    console.log(`   Escrow Wallet: ${escrowKeypair.publicKey.toString()}`);
    console.log(`   Recipient: ${recipientPublicKey.toString()}`);
    console.log(`   Amount: ${amountSOL} SOL (${amountLamports} lamports)`);

    // Create transfer transaction
    const transaction = new Transaction();

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: escrowKeypair.publicKey,
      toPubkey: recipientPublicKey,
      lamports: amountLamports,
    });

    transaction.add(transferInstruction);

    // Get latest blockhash
    const { blockhash } = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = escrowKeypair.publicKey;

    // Sign with escrow keypair
    transaction.sign(escrowKeypair);

    console.log(`   Signing transaction with escrow keypair...`);

    // Send transaction
    const txId = await CONNECTION.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    console.log(`   Transaction sent: ${txId}`);
    console.log(`   Waiting for confirmation...`);

    // Confirm transaction
    const confirmation = await CONNECTION.confirmTransaction(txId, "confirmed");

    if (confirmation.value.err) {
      console.error(`   ❌ Transaction failed:`, confirmation.value.err);
      return NextResponse.json(
        { error: "Transaction failed", details: confirmation.value.err },
        { status: 500 },
      );
    }

    console.log(`   ✅ Transaction confirmed!`);

    return NextResponse.json({
      success: true,
      txId,
      amountSOL,
      recipient: freelancerWallet,
      message: `Successfully released ${amountSOL} SOL to ${freelancerWallet}`,
    });
  } catch (error) {
    console.error("❌ Error releasing funds:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
