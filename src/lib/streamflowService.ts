import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Streamflow Devnet Config
export const STREAMFLOW_CONFIG = {
  devnet: {
    programId: new PublicKey("HqYfJDH7Ybt9V7L9hc8TZyVs8xKtT1B9e1m6qHbQKq4t"),
    treasuryAddress: new PublicKey(
      "2WTxdBPdZHm6t9kqU3D1gHMhfwLy1FMK9hBP6gPWHPvQ",
    ),
    network: "devnet",
  },
};

export interface StreamParams {
  recipient: PublicKey;
  sender: PublicKey;
  mint: PublicKey; // USDC or SOL
  amount: number; // In smallest unit (lamports for SOL, smallest for USDC)
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  cliffTime?: number; // Optional cliff
  description?: string;
}

export interface Stream {
  id: string;
  sender: PublicKey;
  recipient: PublicKey;
  mint: PublicKey;
  amount: number;
  startTime: number;
  endTime: number;
  withdrawn: number;
  status: "active" | "paused" | "completed" | "cancelled";
  transactionHash: string;
  createdAt: number;
}

// USDC Mint Address on Devnet
export const USDC_MINT = new PublicKey(
  "GEKpjwW1gaSccL76UNcjiiKJ8UB3THzkyduK6ajQ56F7",
);

// SOL Native Mint
export const SOL_MINT = new PublicKey("11111111111111111111111111111111");

const CONNECTION = new Connection("https://api.devnet.solana.com", "confirmed");

/**
 * Create a Streamflow stream for escrow
 * User streams funds from their wallet to freelancer over time
 */
export async function createStreamflow(
  params: StreamParams,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<Stream> {
  try {
    // For Devnet, we'll use a simplified implementation
    // In production, you'd call Streamflow's SDK directly

    const transaction = new Transaction();
    const config = STREAMFLOW_CONFIG.devnet;

    // Calculate duration
    const duration = params.endTime - params.startTime;

    // Create associated token accounts if needed (for USDC)
    // For now, we're using a simplified version

    // Add instruction to create stream
    // This is a placeholder - actual implementation would use Streamflow SDK
    const streamCreateInstruction = {
      programId: config.programId,
      keys: [
        { pubkey: params.sender, isSigner: true, isWritable: true },
        { pubkey: params.recipient, isSigner: false, isWritable: false },
        { pubkey: params.mint, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([
        Buffer.from([0]), // Instruction index for create_stream
        // Encode parameters
        Buffer.from(
          new Uint8Array(params.amount.toString().split("").map(Number)),
        ),
      ]),
    };

    transaction.add({
      programId: config.programId,
      keys: streamCreateInstruction.keys,
      data: streamCreateInstruction.data,
    } as any);

    transaction.feePayer = params.sender;
    const { blockhash } = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signedTx = await signTransaction(transaction);

    // For demo, generate a mock transaction ID
    const txId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const stream: Stream = {
      id: txId,
      sender: params.sender,
      recipient: params.recipient,
      mint: params.mint,
      amount: params.amount,
      startTime: params.startTime,
      endTime: params.endTime,
      withdrawn: 0,
      status: "active",
      transactionHash: txId,
      createdAt: Math.floor(Date.now() / 1000),
    };

    return stream;
  } catch (error) {
    console.error("Error creating Streamflow:", error);
    throw error;
  }
}

/**
 * Withdraw available funds from stream
 */
export async function withdrawFromStream(
  streamId: string,
  recipient: PublicKey,
  amount: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
  try {
    const transaction = new Transaction();
    const config = STREAMFLOW_CONFIG.devnet;

    // Add withdrawal instruction
    const withdrawInstruction = {
      programId: config.programId,
      keys: [
        { pubkey: recipient, isSigner: true, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([
        Buffer.from([1]), // Instruction index for withdraw
      ]),
    };

    transaction.add({
      programId: config.programId,
      keys: withdrawInstruction.keys,
      data: withdrawInstruction.data,
    } as any);

    transaction.feePayer = recipient;
    const { blockhash } = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    await signTransaction(transaction);
    const txId = `withdraw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return txId;
  } catch (error) {
    console.error("Error withdrawing from stream:", error);
    throw error;
  }
}

/**
 * Cancel a stream (sender only)
 */
export async function cancelStream(
  streamId: string,
  sender: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
  try {
    const transaction = new Transaction();
    const config = STREAMFLOW_CONFIG.devnet;

    // Add cancel instruction
    const cancelInstruction = {
      programId: config.programId,
      keys: [{ pubkey: sender, isSigner: true, isWritable: true }],
      data: Buffer.concat([
        Buffer.from([2]), // Instruction index for cancel
      ]),
    };

    transaction.add({
      programId: config.programId,
      keys: cancelInstruction.keys,
      data: cancelInstruction.data,
    } as any);

    transaction.feePayer = sender;
    const { blockhash } = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    await signTransaction(transaction);
    const txId = `cancel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return txId;
  } catch (error) {
    console.error("Error cancelling stream:", error);
    throw error;
  }
}

/**
 * Get stream details
 */
export async function getStreamDetails(
  streamId: string,
): Promise<Stream | null> {
  try {
    // In production, this would query the Streamflow program
    // For now, return null
    return null;
  } catch (error) {
    console.error("Error fetching stream:", error);
    return null;
  }
}

/**
 * Calculate vested amount based on current time
 */
export function calculateVestedAmount(stream: Stream): number {
  const now = Math.floor(Date.now() / 1000);

  if (now < stream.startTime) {
    return 0; // Nothing vested yet
  }

  if (now >= stream.endTime) {
    return stream.amount - stream.withdrawn; // All vested
  }

  // Linear vesting
  const elapsed = now - stream.startTime;
  const duration = stream.endTime - stream.startTime;
  const vestedAmount = (stream.amount * elapsed) / duration;

  return Math.floor(vestedAmount) - stream.withdrawn;
}

/**
 * Validate stream parameters
 */
export function validateStreamParams(params: StreamParams): string | null {
  if (params.amount <= 0) {
    return "Amount must be greater than 0";
  }

  if (params.startTime >= params.endTime) {
    return "Start time must be before end time";
  }

  if (params.startTime < Math.floor(Date.now() / 1000)) {
    return "Start time must be in the future";
  }

  const maxDuration = 365 * 24 * 60 * 60; // 1 year
  if (params.endTime - params.startTime > maxDuration) {
    return "Stream duration cannot exceed 1 year";
  }

  return null;
}
