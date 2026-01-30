import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";

// Devnet connection
const CONNECTION = new Connection("https://api.devnet.solana.com", "confirmed");

// Mock escrow program ID (this would be your actual program in production)
export const ESCROW_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111",
); // Replace with actual program

// Demo: Simulate token transfer to escrow
export async function depositToEscrow(
  signer: PublicKey,
  escrowId: string,
  amount: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
  try {
    // Create a simple demo transaction that sends a small amount of SOL to escrow account
    // In production, this would mint/transfer USDC and interact with your actual program

    const transaction = new Transaction();

    // Add a memo to track the escrow ID
    // This is a demo - in production you'd use proper program instructions
    const memoInstruction = {
      keys: [],
      programId: new PublicKey("MemoSq4gDiRvZstLvVoS5allthczar5z8MMVSTQ82W"),
      data: Buffer.from(`ESCROW_DEPOSIT:${escrowId}:${amount}`),
    };

    transaction.add({
      ...memoInstruction,
      keys: [],
    } as any);

    // In a real app, you'd transfer USDC here
    // For demo, we'll just add the memo transaction
    transaction.feePayer = signer;

    const { blockhash } = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signed = await signTransaction(transaction);
    const txId = Math.random().toString(36).substring(2, 15); // Simulated transaction ID

    console.log("Demo deposit transaction:", txId);
    return txId;
  } catch (error) {
    console.error("Error depositing to escrow:", error);
    throw error;
  }
}

// Demo: Simulate release of funds to freelancer
export async function releaseFromEscrow(
  signer: PublicKey,
  freelancerWallet: PublicKey,
  escrowId: string,
  amount: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
  try {
    const transaction = new Transaction();

    // Demo: Add memo with release instruction
    const memoInstruction = {
      keys: [],
      programId: new PublicKey("MemoSq4gDiRvZstLvVoS5allthczar5z8MMVSTQ82W"),
      data: Buffer.from(
        `ESCROW_RELEASE:${escrowId}:${freelancerWallet}:${amount}`,
      ),
    };

    transaction.add({
      ...memoInstruction,
      keys: [],
    } as any);

    transaction.feePayer = signer;

    const { blockhash } = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signed = await signTransaction(transaction);
    const txId = Math.random().toString(36).substring(2, 15); // Simulated transaction ID

    console.log("Demo release transaction:", txId);
    return txId;
  } catch (error) {
    console.error("Error releasing from escrow:", error);
    throw error;
  }
}

// Get SOL balance (for testing)
export async function getSolBalance(wallet: PublicKey): Promise<number> {
  try {
    const balance = await CONNECTION.getBalance(wallet);
    return balance / 1e9; // Convert from lamports to SOL
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}

// For demo purposes - generate a mock transaction signature
export function generateMockTransactionSignature(): string {
  return Keypair.generate().publicKey.toString();
}
