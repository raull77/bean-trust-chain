// Simple deterministic-ish hash for demo blockchain visualization
export function hash(input: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const a = (h2 >>> 0).toString(16).padStart(8, "0");
  const b = (h1 >>> 0).toString(16).padStart(8, "0");
  // expand to 64-char hex by mixing
  let out = a + b;
  while (out.length < 64) out += hashChunk(out).slice(0, 16);
  return "0x" + out.slice(0, 64);
}

function hashChunk(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0") + (Math.imul(h, 2246822507) >>> 0).toString(16).padStart(8, "0");
}

export function shortHash(h: string) {
  if (!h) return "";
  return h.length > 14 ? `${h.slice(0, 10)}…${h.slice(-6)}` : h;
}
