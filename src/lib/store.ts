import { create } from "zustand";
import { persist } from "zustand/middleware";
import { hash } from "./blockchain";

export type Role = "farmer" | "verifier" | "shop" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  organization?: string;
  isActive: boolean;
  createdAt: string;
}

export type VerificationStatus = "pending" | "verified" | "rejected";
export type DistributionStatus = "none" | "distributed" | "received";

export interface BlockchainRecord {
  blockNumber: number;
  previousHash: string;
  currentHash: string;
  timestamp: string;
}

export interface Batch {
  id: string;
  coffeeName: string;
  coffeeType: string;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  harvestDate: string;
  quantityKg: number;
  description: string;
  submittedAt: string;
  status: VerificationStatus;
  distribution: DistributionStatus;
  verification?: {
    verifierName: string;
    verifierId: string;
    institution: string;
    notes: string;
    verifiedAt: string;
  };
  blockchain?: BlockchainRecord;
  shopName?: string;
  shopId?: string;
  receivedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  detail: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
}

interface StoreState {
  currentUser: User | null;
  users: User[];
  batches: Batch[];
  auditLogs: AuditLog[];
  login: (email: string, password: string) => AuthResult;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: "farmer" | "shop" | "verifier";
    organization?: string;
  }) => AuthResult;
  logout: () => void;
  addBatch: (b: Omit<Batch, "id" | "submittedAt" | "status" | "distribution">) => string;
  verifyBatch: (
    id: string,
    data: { verifierName: string; verifierId: string; institution: string; notes: string }
  ) => void;
  rejectBatch: (
    id: string,
    data: { verifierName: string; verifierId: string; institution: string; notes: string }
  ) => void;
  distributeBatch: (id: string, shopName: string, shopId?: string) => void;
  receiveBatch: (id: string, shopName: string, shopId?: string) => void;
  setUserActive: (userId: string, isActive: boolean) => void;
}

// Simulasi hash kata sandi (client-side only)
function simpleHash(password: string): string {
  return hash(`coffeetrace-pw:${password}`);
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

function nextBlock(batches: Batch[], payload: string): BlockchainRecord {
  const verified = batches
    .filter((b) => b.blockchain)
    .sort((a, b) => a.blockchain!.blockNumber - b.blockchain!.blockNumber);
  const last = verified[verified.length - 1]?.blockchain;
  const blockNumber = (last?.blockNumber ?? 1027430) + 1;
  const previousHash = last?.currentHash ?? hash("genesis-coffeetrace");
  const timestamp = new Date().toISOString();
  const currentHash = hash(`${blockNumber}|${previousHash}|${payload}|${timestamp}`);
  return { blockNumber, previousHash, currentHash, timestamp };
}

function makeLog(
  actorId: string,
  actorName: string,
  actorRole: Role,
  action: string,
  detail: string
): AuditLog {
  return {
    id: makeId("LOG"),
    timestamp: new Date().toISOString(),
    actorId,
    actorName,
    actorRole,
    action,
    detail,
  };
}

// ─── Seed Users ───────────────────────────────────────────────────────────────

const seedUsers: User[] = [
  {
    id: "u-admin-1",
    name: "Admin CoffeeTrace",
    email: "admin@coffeetrace.id",
    passwordHash: simpleHash("admin2026"),
    role: "admin",
    organization: "CoffeeTrace",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "u-farmer-1",
    name: "Ahmad Fauzi",
    email: "ahmad.fauzi@coffeetrace.id",
    passwordHash: simpleHash("petani123"),
    role: "farmer",
    organization: "Kebun Kopi Gayo Fauzi",
    isActive: true,
    createdAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "u-farmer-2",
    name: "Siti Rahmawati",
    email: "siti.rahmawati@coffeetrace.id",
    passwordHash: simpleHash("petani456"),
    role: "farmer",
    organization: "Kelompok Tani Toraja Lestari",
    isActive: true,
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "u-verifier-1",
    name: "Ir. Bambang Wijaya, M.Sc.",
    email: "bambang.wijaya@pertanian.go.id",
    passwordHash: simpleHash("verifikasi789"),
    role: "verifier",
    organization: "Kementerian Pertanian RI",
    isActive: true,
    createdAt: "2026-01-05T08:00:00.000Z",
  },
  {
    id: "u-verifier-2",
    name: "Drh. Nurul Hidayah",
    email: "nurul.hidayah@pertanian.go.id",
    passwordHash: simpleHash("verifikasi000"),
    role: "verifier",
    organization: "Dinas Pertanian Jawa Barat",
    isActive: true,
    createdAt: "2026-02-01T08:00:00.000Z",
  },
  {
    id: "u-shop-1",
    name: "Andi Pratama",
    email: "andi.pratama@kopinusantara.id",
    passwordHash: simpleHash("kedai321"),
    role: "shop",
    organization: "Kopi Nusantara Café",
    isActive: true,
    createdAt: "2026-01-20T08:00:00.000Z",
  },
];

// ─── Seed Batches ─────────────────────────────────────────────────────────────

const seedBatches: Batch[] = (() => {
  const arr: Batch[] = [];
  const base: Array<Partial<Batch> & { farmerId: string; farmerName: string }> = [
    {
      coffeeName: "Gayo Highland Arabica",
      coffeeType: "Arabica",
      farmerId: "u-farmer-1",
      farmerName: "Ahmad Fauzi",
      farmLocation: "Takengon, Aceh Tengah",
      harvestDate: "2026-05-12",
      quantityKg: 240,
      description:
        "Kopi Arabika dari ketinggian 1450 mdpl. Proses washed, dengan catatan rasa cokelat gelap, jeruk, dan gula merah.",
    },
    {
      coffeeName: "Toraja Sapan",
      coffeeType: "Arabica",
      farmerId: "u-farmer-2",
      farmerName: "Siti Rahmawati",
      farmLocation: "Sapan, Tana Toraja",
      harvestDate: "2026-04-28",
      quantityKg: 180,
      description:
        "Kopi Arabika Toraja dengan proses wet-hulled (giling basah) tradisional. Rasa earthy, rempah, dan bertekstur syrupy.",
    },
    {
      coffeeName: "Java Preanger Honey",
      coffeeType: "Arabica",
      farmerId: "u-farmer-1",
      farmerName: "Ahmad Fauzi",
      farmLocation: "Pangalengan, Bandung",
      harvestDate: "2026-06-02",
      quantityKg: 320,
      description:
        "Proses honey dari dataran tinggi Priangan. Profil rasa buah batu manis, melati, dan akhiran teh ringan.",
    },
    {
      coffeeName: "Lampung Robusta Premium",
      coffeeType: "Robusta",
      farmerId: "u-farmer-2",
      farmerName: "Siti Rahmawati",
      farmLocation: "Liwa, Lampung Barat",
      harvestDate: "2026-03-15",
      quantityKg: 500,
      description:
        "Robusta premium dari Lampung Barat. Full-bodied dengan catatan rasa cokelat dan kacang.",
    },
    {
      coffeeName: "Kintamani Bali",
      coffeeType: "Arabica",
      farmerId: "u-farmer-1",
      farmerName: "Ahmad Fauzi",
      farmLocation: "Kintamani, Bangli",
      harvestDate: "2026-05-30",
      quantityKg: 210,
      description:
        "Ditanam di antara pohon jeruk di kawasan Kintamani. Keasaman cerah dengan akhiran fruity yang bersih.",
    },
    {
      coffeeName: "Flores Bajawa",
      coffeeType: "Arabica",
      farmerId: "u-farmer-2",
      farmerName: "Siti Rahmawati",
      farmLocation: "Bajawa, Ngada",
      harvestDate: "2026-06-10",
      quantityKg: 150,
      description:
        "Ditanam di tanah vulkanik dataran tinggi Flores. Tekstur halus dengan sentuhan vanila dan tembakau.",
    },
  ];

  base.forEach((b, idx) => {
    const id = `BATCH-${(1024 + idx).toString(36).toUpperCase()}${idx}A`;
    const submittedAt = new Date(Date.parse(b.harvestDate!) + 2 * 86400000).toISOString();
    arr.push({
      id,
      coffeeName: b.coffeeName!,
      coffeeType: b.coffeeType!,
      farmerId: b.farmerId,
      farmerName: b.farmerName,
      farmLocation: b.farmLocation!,
      harvestDate: b.harvestDate!,
      quantityKg: b.quantityKg!,
      description: b.description!,
      submittedAt,
      status: "pending",
      distribution: "none",
    });
  });

  const verifyIds = [0, 1, 2, 4, 5];
  let prev = hash("genesis-coffeetrace");
  let block = 1027431;
  verifyIds.forEach((i) => {
    const verifiedAt = new Date(Date.parse(arr[i].submittedAt) + 86400000 * 2).toISOString();
    const payload = `${arr[i].id}|${arr[i].coffeeName}|${arr[i].farmerName}`;
    const currentHash = hash(`${block}|${prev}|${payload}|${verifiedAt}`);
    arr[i].status = "verified";
    arr[i].verification = {
      verifierName: "Ir. Bambang Wijaya, M.Sc.",
      verifierId: "u-verifier-1",
      institution: "Kementerian Pertanian RI",
      notes: "Dokumentasi lengkap. Sampel sesuai asal yang dideklarasikan. Uji laboratorium lulus.",
      verifiedAt,
    };
    arr[i].blockchain = { blockNumber: block, previousHash: prev, currentHash, timestamp: verifiedAt };
    prev = currentHash;
    block += 1;
  });

  arr[3].status = "rejected";
  arr[3].verification = {
    verifierName: "Ir. Bambang Wijaya, M.Sc.",
    verifierId: "u-verifier-1",
    institution: "Kementerian Pertanian RI",
    notes: "Dokumen asal-usul tidak lengkap. Harap kirim ulang dengan sertifikat pendaftaran kebun.",
    verifiedAt: new Date(Date.parse(arr[3].submittedAt) + 86400000).toISOString(),
  };

  arr[0].distribution = "received";
  arr[0].shopName = "Kopi Nusantara Café";
  arr[0].shopId = "u-shop-1";
  arr[0].receivedAt = new Date(Date.parse(arr[0].verification!.verifiedAt) + 86400000 * 3).toISOString();
  arr[1].distribution = "distributed";
  arr[1].shopName = "Kopi Nusantara Café";
  arr[1].shopId = "u-shop-1";
  arr[4].distribution = "received";
  arr[4].shopName = "Kopi Nusantara Café";
  arr[4].shopId = "u-shop-1";
  arr[4].receivedAt = new Date(Date.parse(arr[4].verification!.verifiedAt) + 86400000 * 2).toISOString();

  return arr;
})();

// ─── Seed Audit Logs ──────────────────────────────────────────────────────────

const seedAuditLogs: AuditLog[] = [
  {
    id: "LOG-SEED-01",
    timestamp: "2026-05-14T09:12:00.000Z",
    actorId: "u-farmer-1",
    actorName: "Ahmad Fauzi",
    actorRole: "farmer",
    action: "BATCH_CREATED",
    detail: "Membuat batch baru: Gayo Highland Arabica (240 kg)",
  },
  {
    id: "LOG-SEED-02",
    timestamp: "2026-04-30T10:05:00.000Z",
    actorId: "u-farmer-2",
    actorName: "Siti Rahmawati",
    actorRole: "farmer",
    action: "BATCH_CREATED",
    detail: "Membuat batch baru: Toraja Sapan (180 kg)",
  },
  {
    id: "LOG-SEED-03",
    timestamp: "2026-05-16T11:30:00.000Z",
    actorId: "u-verifier-1",
    actorName: "Ir. Bambang Wijaya, M.Sc.",
    actorRole: "verifier",
    action: "BATCH_VERIFIED",
    detail: "Memverifikasi batch Gayo Highland Arabica — tercatat di blockchain",
  },
  {
    id: "LOG-SEED-04",
    timestamp: "2026-05-17T14:00:00.000Z",
    actorId: "u-verifier-1",
    actorName: "Ir. Bambang Wijaya, M.Sc.",
    actorRole: "verifier",
    action: "BATCH_VERIFIED",
    detail: "Memverifikasi batch Toraja Sapan — tercatat di blockchain",
  },
  {
    id: "LOG-SEED-05",
    timestamp: "2026-04-16T08:45:00.000Z",
    actorId: "u-verifier-1",
    actorName: "Ir. Bambang Wijaya, M.Sc.",
    actorRole: "verifier",
    action: "BATCH_REJECTED",
    detail: "Menolak batch Lampung Robusta Premium — dokumen tidak lengkap",
  },
  {
    id: "LOG-SEED-06",
    timestamp: "2026-05-19T09:00:00.000Z",
    actorId: "u-shop-1",
    actorName: "Andi Pratama",
    actorRole: "shop",
    action: "BATCH_RECEIVED",
    detail: "Menerima Gayo Highland Arabica di Kopi Nusantara Café",
  },
  {
    id: "LOG-SEED-07",
    timestamp: "2026-06-04T10:20:00.000Z",
    actorId: "u-farmer-1",
    actorName: "Ahmad Fauzi",
    actorRole: "farmer",
    action: "BATCH_CREATED",
    detail: "Membuat batch baru: Java Preanger Honey (320 kg)",
  },
  {
    id: "LOG-SEED-08",
    timestamp: "2026-06-01T13:15:00.000Z",
    actorId: "u-shop-1",
    actorName: "Andi Pratama",
    actorRole: "shop",
    action: "BATCH_RECEIVED",
    detail: "Menerima Kintamani Bali di Kopi Nusantara Café",
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: seedUsers,
      batches: seedBatches,
      auditLogs: seedAuditLogs,

      login: (email, password) => {
        const passwordHash = simpleHash(password);
        const user = get().users.find(
          (u) =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.passwordHash === passwordHash
        );
        if (!user) {
          return { success: false, message: "Email atau kata sandi tidak sesuai." };
        }
        if (!user.isActive) {
          return {
            success: false,
            message: "Akun Anda telah dinonaktifkan. Hubungi administrator sistem.",
          };
        }
        set({ currentUser: user });
        return { success: true, message: "Berhasil masuk." };
      },

      register: (data) => {
        const existing = get().users.find(
          (u) => u.email.toLowerCase() === data.email.toLowerCase()
        );
        if (existing) {
          return {
            success: false,
            message: "Email ini sudah terdaftar. Silakan gunakan email lain.",
          };
        }
        const newUser: User = {
          id: makeId("u"),
          name: data.name,
          email: data.email,
          passwordHash: simpleHash(data.password),
          role: data.role,
          organization: data.organization ?? "",
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        const roleLabel =
          data.role === "farmer"
            ? "Petani"
            : data.role === "shop"
              ? "Kedai Kopi"
              : "Petugas Verifikasi";
        const log = makeLog(
          newUser.id,
          newUser.name,
          newUser.role,
          "USER_REGISTERED",
          `Akun baru terdaftar sebagai ${roleLabel}${data.organization ? ` — ${data.organization}` : ""}`
        );
        set({
          users: [...get().users, newUser],
          currentUser: newUser,
          auditLogs: [log, ...get().auditLogs],
        });
        return { success: true, message: "Akun berhasil dibuat." };
      },

      logout: () => set({ currentUser: null }),

      addBatch: (b) => {
        const id = makeId("BATCH");
        const batch: Batch = {
          ...b,
          id,
          submittedAt: new Date().toISOString(),
          status: "pending",
          distribution: "none",
        };
        const log = makeLog(
          b.farmerId,
          b.farmerName,
          "farmer",
          "BATCH_CREATED",
          `Membuat batch baru: ${b.coffeeName} (${b.quantityKg} kg) dari ${b.farmLocation}`
        );
        set({
          batches: [batch, ...get().batches],
          auditLogs: [log, ...get().auditLogs],
        });
        return id;
      },

      verifyBatch: (id, data) => {
        const batches = get().batches;
        const batch = batches.find((b) => b.id === id);
        if (!batch) return;
        const payload = `${batch.id}|${batch.coffeeName}|${batch.farmerName}`;
        const record = nextBlock(batches, payload);
        const updated: Batch = {
          ...batch,
          status: "verified",
          verification: { ...data, verifiedAt: record.timestamp },
          blockchain: record,
        };
        const log = makeLog(
          data.verifierId,
          data.verifierName,
          "verifier",
          "BATCH_VERIFIED",
          `Memverifikasi batch ${batch.coffeeName} (${batch.id}) — tercatat di blockchain blok #${record.blockNumber}`
        );
        set({
          batches: batches.map((b) => (b.id === id ? updated : b)),
          auditLogs: [log, ...get().auditLogs],
        });
      },

      rejectBatch: (id, data) => {
        const batches = get().batches;
        const batch = batches.find((b) => b.id === id);
        if (!batch) return;
        const log = makeLog(
          data.verifierId,
          data.verifierName,
          "verifier",
          "BATCH_REJECTED",
          `Menolak batch ${batch.coffeeName} (${batch.id})${data.notes ? ` — ${data.notes.slice(0, 80)}` : ""}`
        );
        set({
          batches: batches.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: "rejected",
                  verification: { ...data, verifiedAt: new Date().toISOString() },
                }
              : b
          ),
          auditLogs: [log, ...get().auditLogs],
        });
      },

      distributeBatch: (id, shopName, shopId) => {
        const batch = get().batches.find((b) => b.id === id);
        const user = get().currentUser;
        if (batch && user) {
          const log = makeLog(
            user.id,
            user.name,
            user.role,
            "BATCH_DISTRIBUTED",
            `Mendistribusikan ${batch.coffeeName} ke ${shopName}`
          );
          set({
            batches: get().batches.map((b) =>
              b.id === id ? { ...b, distribution: "distributed", shopName, shopId } : b
            ),
            auditLogs: [log, ...get().auditLogs],
          });
        } else {
          set({
            batches: get().batches.map((b) =>
              b.id === id ? { ...b, distribution: "distributed", shopName, shopId } : b
            ),
          });
        }
      },

      receiveBatch: (id, shopName, shopId) => {
        const batch = get().batches.find((b) => b.id === id);
        const user = get().currentUser;
        if (batch && user) {
          const log = makeLog(
            user.id,
            user.name,
            user.role,
            "BATCH_RECEIVED",
            `Menerima ${batch.coffeeName} di ${shopName}`
          );
          set({
            batches: get().batches.map((b) =>
              b.id === id
                ? { ...b, distribution: "received", shopName, shopId, receivedAt: new Date().toISOString() }
                : b
            ),
            auditLogs: [log, ...get().auditLogs],
          });
        } else {
          set({
            batches: get().batches.map((b) =>
              b.id === id
                ? { ...b, distribution: "received", shopName, shopId, receivedAt: new Date().toISOString() }
                : b
            ),
          });
        }
      },

      setUserActive: (userId, isActive) => {
        const user = get().users.find((u) => u.id === userId);
        const admin = get().currentUser;
        if (!user || !admin) return;
        const log = makeLog(
          admin.id,
          admin.name,
          admin.role,
          isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
          `${isActive ? "Mengaktifkan" : "Menonaktifkan"} akun ${user.name} (${user.email})`
        );
        set({
          users: get().users.map((u) =>
            u.id === userId ? { ...u, isActive } : u
          ),
          auditLogs: [log, ...get().auditLogs],
        });
      },
    }),
    { name: "coffeetrace-store-v3" }
  )
);
