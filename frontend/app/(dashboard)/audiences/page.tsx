"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { validateRequired } from "@/lib/validation";

type Audience = {
  id: number;
  name: string;
  filterRule: { field?: string; value?: string };
  memberCount?: number;
  createdAt: string;
};

const FILTER_FIELDS = [
  { value: "city", label: "City" },
  { value: "tags", label: "Tag" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "company", label: "Company (custom)" },
  { value: "role", label: "Role (custom)" },
];

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [field, setField] = useState("city");
  const [value, setValue] = useState("");

  async function loadAudiences() {
    try {
      setError("");
      const data = await api.getAudiences();
      setAudiences(data.audiences || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load audiences");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAudiences();
  }, []);

  async function createAudience(e: React.FormEvent) {
    e.preventDefault();

    const nameError = validateRequired(name, "Audience name");
    const valueError = validateRequired(value, "Filter value");
    if (nameError || valueError) {
      setError(nameError || valueError || "Invalid input");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await api.createAudience({
        name: name.trim(),
        filterRule: { field, value: value.trim() },
      });
      setName("");
      setValue("");
      setSuccess("Audience created");
      await loadAudiences();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create audience");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audiences</h1>
          <p className="page-subtitle">Save filtered groups of contacts for campaigns</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">Create audience</h2>
        <form onSubmit={createAudience} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Name</label>
            <input className="input mt-1" placeholder="VIP customers" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Filter by</label>
            <select className="input mt-1" value={field} onChange={(e) => setField(e.target.value)}>
              {FILTER_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Equals</label>
            <input className="input mt-1" placeholder="vip" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create audience"}
          </button>
        </form>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : audiences.length === 0 ? (
        <div className="card empty-state">No audiences yet. Create one above.</div>
      ) : (
        <div className="grid gap-4">
          {audiences.map((a) => (
            <div key={a.id} className="card p-5 flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">{a.name}</div>
                <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  Filter: {a.filterRule?.field || "all"} = {String(a.filterRule?.value ?? "any")}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Created {new Date(a.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="stat-value text-2xl">{a.memberCount ?? 0}</div>
                <div className="stat-label">members</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
