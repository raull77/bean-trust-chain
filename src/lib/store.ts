import { create } from "zustand";
import { persist } from "zustand/middleware";
import { hash } from "./blockchain";

export type Role = "farmer" | "verifier" | "shop";

export interface User {
  id: string;
  name: string;
  role: Role;
  organization?: string;
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
    institution: string;
    notes: string;
    verifiedAt: string;
  };
  blockchain?: BlockchainRecord;
  shopName?: string;
  receivedAt?: string;
}

interface StoreState {
  currentUser: User | null;
  users: User[];
  batches: Batch[];
  login: (role: Role) => void;
  logout: () => void;
  addBatch: (b: Omit<Batch, "id" | "submittedAt" | "status" | "distribution">) => string;
  verifyBatch: (id: string, data: { verifierName: string; institution: string; notes: string }) => void;
  rejectBatch: (id: string, data: { verifierName: string; institution: string; notes: string }) => void;
  distributeBatch: (id: string, shopName: string) => void;
  receiveBatch: (id: string, shopName: string) => void;
}

const demoUsers: User[] = [
  { id: "u-farmer", name: "Pak Sutrisno", role: "farmer", organization: "Kebun Kopi Sutrisno" },
  { id: "u-verifier", name: "Ir. Bambang Wijaya", role: "verifier", organization: "Kementerian Pertanian RI" },
  { id: "u-shop", name: "Andi Pratama", role: "shop", organization: "Kopi Nusantara Café" },
];

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

function nextBlock(batches: Batch[], payload: string): BlockchainRecord {
  const verified = batches.filter((b) => b.blockchain).sort((a, b) => (a.blockchain!.blockNumber - b.blockchain!.blockNumber));
  const last = verified[verified.length - 1]?.blockchain;
  const blockNumber = (last?.blockNumber ?? 1027430) + 1;
  const previousHash = last?.currentHash ?? hash("genesis-coffeetrace");
  const timestamp = new Date().toISOString();
  const currentHash = hash(`${blockNumber}|${previousHash}|${payload}|${timestamp}`);
  return { blockNumber, previousHash, currentHash, timestamp };
}

const seedBatches: Batch[] = (() => {
  const arr: Batch[] = [];
  const base: Array<Partial<Batch>> = [
    {
      coffeeName: "Gayo Highland Arabica",
      coffeeType: "Arabica",
      farmerName: "Pak Sutrisno",
      farmLocation: "Takengon, Aceh Tengah",
      harvestDate: "2026-05-12",
      quantityKg: 240,
      description: "Notes of dark chocolate, citrus, and brown sugar. Washed process from 1450m elevation.",
    },
    {
      coffeeName: "Toraja Sapan",
      coffeeType: "Arabica",
      farmerName: "Ibu Marlina",
      farmLocation: "Sapan, Tana Toraja",
      harvestDate: "2026-04-28",
      quantityKg: 180,
      description: "Earthy and spicy with a syrupy body. Traditional wet-hulled (giling basah).",
    },
    {
      coffeeName: "Java Preanger Honey",
      coffeeType: "Arabica",
      farmerName: "Pak Sutrisno",
      farmLocation: "Pangalengan, Bandung",
      harvestDate: "2026-06-02",
      quantityKg: 320,
      description: "Honey processed. Stone fruit sweetness, jasmine, light tea finish.",
    },
    {
      coffeeName: "Lampung Robusta Premium",
      coffeeType: "Robusta",
      farmerName: "Pak Hartono",
      farmLocation: "Liwa, Lampung Barat",
      harvestDate: "2026-03-15",
      quantityKg: 500,
      description: "Bold, full-bodied robusta with cocoa and nutty undertones.",
    },
    {
      coffeeName: "Kintamani Bali",
      coffeeType: "Arabica",
      farmerName: "Ibu Marlina",
      farmLocation: "Kintamani, Bangli",
      harvestDate: "2026-05-30",
      quantityKg: 210,
      description: "Bright citrus acidity with a clean, fruity finish. Grown alongside citrus trees.",
    },
    {
      coffeeName: "Flores Bajawa",
      coffeeType: "Arabica",
      farmerName: "Pak Yosef",
      farmLocation: "Bajawa, Ngada",
      harvestDate: "2026-06-10",
      quantityKg: 150,
      description: "Volcanic soil, smooth body, hints of vanilla and tobacco.",
    },
  ];

  base.forEach((b, idx) => {
    const id = `BATCH-${(1024 + idx).toString(36).toUpperCase()}${idx}A`;
    const submittedAt = new Date(Date.parse(b.harvestDate!) + 2 * 86400000).toISOString();
    arr.push({
      id,
      coffeeName: b.coffeeName!,
      coffeeType: b.coffeeType!,
      farmerId: "u-farmer",
      farmerName: b.farmerName!,
      farmLocation: b.farmLocation!,
      harvestDate: b.harvestDate!,
      quantityKg: b.quantityKg!,
      description: b.description!,
      submittedAt,
      status: "pending",
      distribution: "none",
    });
  });

  // Verify several
  const verifyIds = [0, 1, 2, 4, 5];
  let prev = hash("genesis-coffeetrace");
  let block = 1027431;
  verifyIds.forEach((i) => {
    const verifiedAt = new Date(Date.parse(arr[i].submittedAt) + 86400000 * 2).toISOString();
    const payload = `${arr[i].id}|${arr[i].coffeeName}|${arr[i].farmerName}`;
    const currentHash = hash(`${block}|${prev}|${payload}|${verifiedAt}`);
    arr[i].status = "verified";
    arr[i].verification = {
      verifierName: "Ir. Bambang Wijaya",
      institution: "Kementerian Pertanian RI",
      notes: "Documentation complete, sample matches declared origin. Lab tests passed.",
      verifiedAt,
    };
    arr[i].blockchain = { blockNumber: block, previousHash: prev, currentHash, timestamp: verifiedAt };
    prev = currentHash;
    block += 1;
  });

  // Reject one
  arr[3].status = "rejected";
  arr[3].verification = {
    verifierName: "Ir. Bambang Wijaya",
    institution: "Kementerian Pertanian RI",
    notes: "Incomplete origin documentation. Please resubmit with farm registration certificate.",
    verifiedAt: new Date(Date.parse(arr[3].submittedAt) + 86400000).toISOString(),
  };

  // Distribute & receive a few
  arr[0].distribution = "received";
  arr[0].shopName = "Kopi Nusantara Café";
  arr[0].receivedAt = new Date(Date.parse(arr[0].verification!.verifiedAt) + 86400000 * 3).toISOString();
  arr[1].distribution = "distributed";
  arr[1].shopName = "Kopi Nusantara Café";
  arr[4].distribution = "received";
  arr[4].shopName = "Kopi Nusantara Café";
  arr[4].receivedAt = new Date(Date.parse(arr[4].verification!.verifiedAt) + 86400000 * 2).toISOString();

  return arr;
})();

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: demoUsers,
      batches: seedBatches,
      login: (role) => {
        const u = get().users.find((x) => x.role === role);
        if (u) set({ currentUser: u });
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
        set({ batches: [batch, ...get().batches] });
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
        set({ batches: batches.map((b) => (b.id === id ? updated : b)) });
      },
      rejectBatch: (id, data) => {
        set({
          batches: get().batches.map((b) =>
            b.id === id
              ? { ...b, status: "rejected", verification: { ...data, verifiedAt: new Date().toISOString() } }
              : b,
          ),
        });
      },
      distributeBatch: (id, shopName) => {
        set({
          batches: get().batches.map((b) => (b.id === id ? { ...b, distribution: "distributed", shopName } : b)),
        });
      },
      receiveBatch: (id, shopName) => {
        set({
          batches: get().batches.map((b) =>
            b.id === id
              ? { ...b, distribution: "received", shopName, receivedAt: new Date().toISOString() }
              : b,
          ),
        });
      },
    }),
    { name: "coffeetrace-store-v1" },
  ),
);
