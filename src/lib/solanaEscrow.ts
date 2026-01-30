import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// Devnet connection
export const CONNECTION = new Connection(
  "https://api.devnet.solana.com",
  "confirmed",
);

// Escrow wallet - This holds funds temporarily
// In production, this would be a PDA (Program Derived Account)
const ESCROW_WALLET = new PublicKey(
  "6J5xMKw8AX11WV41waxpJuKJjf3gFChr5qsQj4nESKZu", // Replace with your escrow wallet
);

// SOL Mint
export const SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112",
);

/**
 * Create a simple escrow by transferring SOL to escrow wallet
 * Client → Escrow Wallet (funds held)
 */
export async function createStreamEscrow(
  params: {
    signer: PublicKey; // Client wallet
    recipient: PublicKey; // Freelancer wallet
    amount: number; // Amount in lamports
    startTime: number; // Unix timestamp
    endTime: number; // Unix timestamp
  },
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<{ txId: string; success: boolean }> {
  try {
    const transaction = new Transaction();

    // Transfer SOL from client to escrow wallet
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: params.signer,
      toPubkey: ESCROW_WALLET,
      lamports: params.amount,
    });

    transaction.add(transferInstruction);

    // Set transaction details
    transaction.feePayer = params.signer;
    const { blockhash } = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Sign with user's wallet
    const signedTx = await signTransaction(transaction);

    // Send transaction
    const txId = await CONNECTION.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    // Confirm transaction
    const confirmation = await CONNECTION.confirmTransaction(txId, "confirmed");

    if (confirmation.value.err) {
      throw new Error("Transaction failed confirmation");
    }

    console.log("✅ Escrow created successfully:", txId);
    return { txId, success: true };
  } catch (error) {
    console.error("❌ Error creating escrow:", error);
    throw error;
  }
}

/**
 * Release funds from escrow to freelancer
 * Calls backend API which signs with escrow keypair
 * Escrow Wallet → Freelancer Wallet
 */
export async function releaseEscrowFunds(
  freelancerWallet: PublicKey,
  amountSOL: number,
): Promise<string> {
  try {
    console.log(
      `💰 Releasing ${amountSOL} SOL to ${freelancerWallet.toString()}...`,
    );

    const response = await fetch("/api/escrow/release", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        freelancerWallet: freelancerWallet.toString(),
        amountSOL,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to release funds");
    }

    const data = await response.json();

    console.log(`✅ Funds released successfully!`);
    console.log(`   Amount: ${data.amountSOL} SOL`);
    console.log(`   Recipient: ${data.recipient}`);
    console.log(`   Transaction: ${data.txId}`);

    return data.txId;
  } catch (error) {
    console.error("❌ Error releasing funds:", error);
    throw error;
  }
}

/**
 * Withdraw vested funds from escrow (freelancer only)
 */
export async function withdrawFromStream(
  streamId: string,
  recipient: PublicKey,
  amount: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
  try {
    const transaction = new Transaction();

    // Transfer from escrow wallet to freelancer
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: ESCROW_WALLET,
      toPubkey: recipient,
      lamports: amount,
    });

    transaction.add(transferInstruction);

    transaction.feePayer = recipient;
    const { blockhash } = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signedTx = await signTransaction(transaction);
    const txId = await CONNECTION.sendRawTransaction(signedTx.serialize());

    await CONNECTION.confirmTransaction(txId, "confirmed");

    console.log("✅ Withdrawal successful:", txId);
    return txId;
  } catch (error) {
    console.error("❌ Error withdrawing from stream:", error);
    throw error;
  }
}

/**
 * Get SOL balance
 */
export async function getSolBalance(wallet: PublicKey): Promise<number> {
  try {
    const balance = await CONNECTION.getBalance(wallet);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching SOL balance:", error);
    return 0;
  }
}

/**
 * Check if wallet has enough SOL for escrow + fees
 */
export async function hasEnoughBalance(
  wallet: PublicKey,
  amountSOL: number,
): Promise<boolean> {
  try {
    const balance = await getSolBalance(wallet);
    const requiredAmount = amountSOL + 0.01; // Add 0.01 SOL for fees
    return balance >= requiredAmount;
  } catch (error) {
    console.error("Error checking balance:", error);
    return false;
  }
}

/**
 * Get escrow wallet address
 */
export function getEscrowWallet(): PublicKey {
  return ESCROW_WALLET;
}

/**
 * Fund the escrow wallet (run once with your client wallet)
 * Client → Escrow Wallet
 */
export async function fundEscrowWallet(
  fromWallet: PublicKey,
  amountSOL: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
  try {
    console.log(
      `💵 Funding escrow wallet with ${amountSOL} SOL from ${fromWallet.toString()}...`,
    );

    const transaction = new Transaction();

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: fromWallet,
      toPubkey: ESCROW_WALLET,
      lamports: Math.floor(amountSOL * LAMPORTS_PER_SOL),
    });

    transaction.add(transferInstruction);
    transaction.feePayer = fromWallet;

    const { blockhash } = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    console.log(`   Signing transaction with your wallet...`);
    const signedTx = await signTransaction(transaction);

    console.log(`   Sending transaction...`);
    const txId = await CONNECTION.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    console.log(`   Waiting for confirmation...`);
    await CONNECTION.confirmTransaction(txId, "confirmed");

    console.log(`✅ Escrow wallet funded successfully!`);
    console.log(`   Amount: ${amountSOL} SOL`);
    console.log(`   Escrow Wallet: ${ESCROW_WALLET.toString()}`);
    console.log(`   Transaction: ${txId}`);

    return txId;
  } catch (error) {
    console.error("❌ Error funding escrow wallet:", error);
    throw error;
  }
}
