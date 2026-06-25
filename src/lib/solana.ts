
/**
 * solana.ts — Integrasi CoffeeTrace dengan Solana Devnet
 *
 * Arsitektur:
 * - Satu wallet verifier permanen yang dibaca dari VITE_SOLANA_PRIVATE_KEY
 * - Wallet di-fund SEKALI melalui https://faucet.solana.com (tidak perlu
 *   airdrop setiap transaksi)
 * - Setiap verifikasi batch dikirim sebagai Memo Transaction berisi
 *   payload JSON data verifikasi
 *
 * Setup:
 * 1. Salin .env.example ke .env
 * 2. Isi VITE_SOLANA_PRIVATE_KEY dengan private key Base58
 * 3. Fund wallet sekali: https://faucet.solana.com
 *    (masukkan Public Key: FutAfU4Zi4D5k3HPnhFDavipzqhTgKhhnguB2k73Fwpu)
 */
import { Buffer } from "buffer";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

// ─── Konstanta ────────────────────────────────────────────────────────────────

/** Memo Program ID resmi Solana (on mainnet dan devnet) */
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

const DEVNET_RPC = "https://api.devnet.solana.com";
const EXPLORER_BASE = "https://explorer.solana.com";

// ─── Koneksi ──────────────────────────────────────────────────────────────────

/**
 * Membuat koneksi ke Solana Devnet dengan commitment "confirmed".
 * Menggunakan endpoint publik Solana Devnet.
 */
export function connectToDevnet(): Connection {
  return new Connection(DEVNET_RPC, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
    disableRetryOnRateLimit: false,
  });
}

// ─── Wallet Verifier Permanen ─────────────────────────────────────────────────

/**
 * Membaca wallet verifier permanen dari environment variable.
 * Wallet ini di-fund sekali dan digunakan untuk semua transaksi verifikasi.
 *
 * @throws Error jika VITE_SOLANA_PRIVATE_KEY tidak tersedia atau tidak valid
 */
export function getVerifierWallet(): Keypair {
  const rawKey = import.meta.env.VITE_SOLANA_PRIVATE_KEY as string | undefined;

  if (!rawKey || rawKey.trim() === "") {
    throw new Error(
      "VITE_SOLANA_PRIVATE_KEY belum dikonfigurasi. " +
        "Salin .env.example ke .env dan isi private key wallet verifier."
    );
  }

  try {
    const secretKey = bs58.decode(rawKey.trim());
    return Keypair.fromSecretKey(secretKey);
  } catch {
    throw new Error(
      "VITE_SOLANA_PRIVATE_KEY tidak valid. Pastikan formatnya Base58 (bukan array angka)."
    );
  }
}

// ─── Payload Batch ────────────────────────────────────────────────────────────

export interface BatchHashData {
  batchId: string;
  coffeeName: string;
  farmerName: string;
  farmLocation: string;
  harvestDate: string;
  quantityKg: number;
  verifierName: string;
  institution: string;
  verifiedAt: string;
}

/**
 * Membuat JSON payload dari data batch untuk dicatat sebagai Memo di Solana.
 * Payload dibatasi agar tidak melebihi batas ukuran memo (~566 byte).
 */
export function createBatchHash(data: BatchHashData): string {
  return JSON.stringify({
    app: "CoffeeTrace",
    v: "1.0",
    batchId: data.batchId,
    coffee: data.coffeeName,
    farmer: data.farmerName,
    location: data.farmLocation,
    harvest: data.harvestDate,
    qty: data.quantityKg,
    verifier: data.verifierName,
    institution: data.institution,
    ts: data.verifiedAt,
  });
}

// ─── Submit ke Solana ─────────────────────────────────────────────────────────

export interface SolanaSubmitResult {
  success: true;
  transactionSignature: string;
  blockchainNetwork: "Solana Devnet";
  submittedAt: string;
  walletPublicKey: string;
}

export interface SolanaSubmitError {
  success: false;
  error: string;
}

/**
 * Mengirim Memo Transaction ke Solana Devnet berisi payload verifikasi batch.
 *
 * Alur:
 * 1. Baca wallet verifier dari env (tidak generate keypair baru)
 * 2. Buat Memo Instruction dengan payload JSON
 * 3. Susun dan tanda tangani transaksi
 * 4. Kirim dan tunggu konfirmasi (commitment: "confirmed")
 * 5. Kembalikan Transaction Signature
 *
 * Prasyarat: wallet harus memiliki saldo SOL untuk biaya transaksi.
 * Fund sekali di https://faucet.solana.com
 */
export async function submitBatchToSolana(
  memoPayload: string
): Promise<SolanaSubmitResult | SolanaSubmitError> {
  // 1. Validasi wallet
  let wallet: Keypair;
  try {
    wallet = getVerifierWallet();
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Wallet verifier tidak valid.",
    };
  }

  try {
    const connection = connectToDevnet();

    // 2. Cek saldo — berikan pesan yang jelas jika wallet kosong
    const balance = await connection.getBalance(wallet.publicKey);
    if (balance === 0) {
      return {
        success: false,
        error:
          `Wallet verifier (${wallet.publicKey.toBase58().slice(0, 8)}…) tidak memiliki saldo SOL. ` +
          "Fund wallet di https://faucet.solana.com lalu coba lagi.",
      };
    }

    // 3. Buat Memo Instruction
    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoPayload, "utf-8"),
    });

    // 4. Susun transaksi
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");

    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    transaction.add(memoInstruction);

    // 5. Kirim dan konfirmasi
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet],
      {
        commitment: "confirmed",
        maxRetries: 3,
      }
    );

    return {
      success: true,
      transactionSignature: signature,
      blockchainNetwork: "Solana Devnet",
      submittedAt: new Date().toISOString(),
      walletPublicKey: wallet.publicKey.toBase58(),
    };
  } catch (err: unknown) {
    // Tangani error spesifik
    let message = "Terjadi kesalahan saat menghubungi Solana Devnet.";
    if (err instanceof Error) {
      if (err.message.includes("Attempt to debit")) {
        message =
          "Saldo wallet verifier tidak cukup untuk biaya transaksi. " +
          "Fund wallet di https://faucet.solana.com lalu coba lagi.";
      } else if (
        err.message.includes("429") ||
        err.message.includes("Too Many Requests")
      ) {
        message =
          "RPC Solana Devnet membatasi permintaan. Tunggu beberapa detik lalu coba lagi.";
      } else if (
        err.message.includes("timeout") ||
        err.message.includes("timed out")
      ) {
        message =
          "Koneksi ke Solana Devnet timeout. Periksa jaringan internet dan coba lagi.";
      } else {
        message = err.message;
      }
    }
    return { success: false, error: message };
  }
}

// ─── Explorer URL ─────────────────────────────────────────────────────────────

/**
 * Menghasilkan URL Solana Explorer untuk transaction signature.
 * Contoh: https://explorer.solana.com/tx/{sig}?cluster=devnet
 */
export function getExplorerUrl(transactionSignature: string): string {
  return `${EXPLORER_BASE}/tx/${transactionSignature}?cluster=devnet`;
}

/**
 * Menghasilkan URL Solana Explorer untuk alamat wallet.
 */
export function getWalletExplorerUrl(publicKey: string): string {
  return `${EXPLORER_BASE}/address/${publicKey}?cluster=devnet`;
}
