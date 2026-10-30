// Where codes and verified leads are kept. Server only.
// Production: Supabase (PostgreSQL) through its REST API with the service-role key.
// Development: an in-memory store (cleared when the dev server restarts).

export interface StoredCode {
  phone: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

export interface LeadInput {
  phone: string;
  consentVersion: string;
  consentText: string;
  source: string;
  userAgent: string;
}

export interface Store {
  /** Replaces any earlier code for this number. */
  saveCode(code: StoredCode): Promise<void>;
  getCode(phone: string): Promise<StoredCode | null>;
  /** Records a wrong guess; returns the new attempt count. */
  addAttempt(phone: string): Promise<number>;
  deleteCode(phone: string): Promise<void>;
  /** One row per code sent, for rate limits. */
  logSend(phone: string, ip: string, at: number): Promise<void>;
  countSends(filter: { phone?: string; ip?: string }, since: number): Promise<number>;
  /** Creates the lead on first verification, refreshes it afterwards. */
  upsertLead(lead: LeadInput, at: number): Promise<void>;
  logEvent(phone: string, action: string, details: Record<string, unknown>, at: number): Promise<void>;
}

// ---------- memory (development and tests) ----------

export class MemoryStore implements Store {
  codes = new Map<string, StoredCode>();
  sends: { phone: string; ip: string; at: number }[] = [];
  leads = new Map<string, LeadInput & { firstVerifiedAt: number; lastVerifiedAt: number }>();
  events: { phone: string; action: string; details: Record<string, unknown>; at: number }[] = [];

  async saveCode(code: StoredCode) {
    this.codes.set(code.phone, { ...code });
  }
  async getCode(phone: string) {
    const c = this.codes.get(phone);
    return c ? { ...c } : null;
  }
  async addAttempt(phone: string) {
    const c = this.codes.get(phone);
    if (!c) return 0;
    c.attempts += 1;
    return c.attempts;
  }
  async deleteCode(phone: string) {
    this.codes.delete(phone);
  }
  async logSend(phone: string, ip: string, at: number) {
    this.sends.push({ phone, ip, at });
    this.sends = this.sends.filter((s) => s.at > at - 24 * 3_600_000);
  }
  async countSends(filter: { phone?: string; ip?: string }, since: number) {
    return this.sends.filter((s) => s.at >= since && (!filter.phone || s.phone === filter.phone) && (!filter.ip || s.ip === filter.ip)).length;
  }
  async upsertLead(lead: LeadInput, at: number) {
    const prev = this.leads.get(lead.phone);
    this.leads.set(lead.phone, { ...lead, firstVerifiedAt: prev?.firstVerifiedAt ?? at, lastVerifiedAt: at });
  }
  async logEvent(phone: string, action: string, details: Record<string, unknown>, at: number) {
    this.events.push({ phone, action, details, at });
  }
}

// ---------- Supabase (production) ----------

const iso = (ms: number) => new Date(ms).toISOString();

export class SupabaseStore implements Store {
  constructor(
    private url: string,
    private serviceKey: string,
  ) {}

  private async req(path: string, init: RequestInit & { prefer?: string } = {}) {
    const res = await fetch(`${this.url.replace(/\/$/, "")}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: this.serviceKey,
        Authorization: `Bearer ${this.serviceKey}`,
        "Content-Type": "application/json",
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase ${init.method ?? "GET"} ${path.split("?")[0]} failed: ${res.status}`);
    return res;
  }

  async saveCode(c: StoredCode) {
    await this.req("otp_codes", {
      method: "POST",
      prefer: "resolution=merge-duplicates",
      body: JSON.stringify({ phone: c.phone, code_hash: c.codeHash, expires_at: iso(c.expiresAt), attempts: c.attempts, created_at: iso(c.createdAt) }),
    });
  }
  async getCode(phone: string) {
    const rows = (await (await this.req(`otp_codes?phone=eq.${encodeURIComponent(phone)}&select=*`)).json()) as {
      phone: string;
      code_hash: string;
      expires_at: string;
      attempts: number;
      created_at: string;
    }[];
    const r = rows[0];
    return r
      ? { phone: r.phone, codeHash: r.code_hash, expiresAt: Date.parse(r.expires_at), attempts: r.attempts, createdAt: Date.parse(r.created_at) }
      : null;
  }
  async addAttempt(phone: string) {
    // Atomic increment in the database (function defined in the migration)
    const res = await this.req("rpc/otp_add_attempt", { method: "POST", body: JSON.stringify({ p_phone: phone }) });
    return Number(await res.json()) || 0;
  }
  async deleteCode(phone: string) {
    await this.req(`otp_codes?phone=eq.${encodeURIComponent(phone)}`, { method: "DELETE" });
  }
  async logSend(phone: string, ip: string, at: number) {
    await this.req("otp_sends", { method: "POST", body: JSON.stringify({ phone, ip, created_at: iso(at) }) });
  }
  async countSends(filter: { phone?: string; ip?: string }, since: number) {
    const q = [
      `created_at=gte.${encodeURIComponent(iso(since))}`,
      filter.phone ? `phone=eq.${encodeURIComponent(filter.phone)}` : "",
      filter.ip ? `ip=eq.${encodeURIComponent(filter.ip)}` : "",
    ].filter(Boolean);
    const res = await this.req(`otp_sends?select=id&${q.join("&")}`, { method: "HEAD", prefer: "count=exact" });
    return Number(res.headers.get("content-range")?.split("/")[1] ?? 0);
  }
  async upsertLead(l: LeadInput, at: number) {
    await this.req("rpc/upsert_verified_lead", {
      method: "POST",
      body: JSON.stringify({
        p_phone: l.phone,
        p_consent_version: l.consentVersion,
        p_consent_text: l.consentText,
        p_source: l.source,
        p_user_agent: l.userAgent,
        p_at: iso(at),
      }),
    });
  }
  async logEvent(phone: string, action: string, details: Record<string, unknown>, at: number) {
    await this.req("lead_events", { method: "POST", body: JSON.stringify({ phone, action, details, created_at: iso(at) }) });
  }
}

// One store per server process
let shared: Store | null = null;
export function getStore(url?: string, key?: string): Store {
  if (!shared) shared = url && key ? new SupabaseStore(url, key) : new MemoryStore();
  return shared;
}
