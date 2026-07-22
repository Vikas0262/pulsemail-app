"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { validateFutureDate } from "@/lib/validation";
import CampaignNav from "@/components/CampaignNav";

type Campaign = {
  id: number;
  name: string;
  subject: string;
  body: string;
  status: string;
  scheduledAt?: string | null;
  recipients: { id: number; email: string; status: string; contactId?: number | null }[];
};

type Audience = { id: number; name: string; memberCount?: number };

type MatchResult = {
  matched: { entry: string; name: string | null; email: string }[];
  unmatched: string[];
};

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = Number(params.id);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recipientTab, setRecipientTab] = useState<"audience" | "list">("audience");
  const [audienceId, setAudienceId] = useState("");
  const [tag, setTag] = useState("");
  const [pasteList, setPasteList] = useState("");
  const [matchPreview, setMatchPreview] = useState<MatchResult | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCampaign = useCallback(async () => {
    const data = await api.getCampaign(campaignId);
    setCampaign(data.campaign);
  }, [campaignId]);

  useEffect(() => {
    Promise.all([
      loadCampaign(),
      api.getAudiences().then((d) => setAudiences(d.audiences || [])),
    ])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadCampaign]);

  async function applyAudienceRecipients() {
    if (!audienceId && !tag.trim()) {
      setError("Select an audience or enter a tag");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setSuccess("");
      await api.setRecipientsFromAudience(campaignId, {
        audienceId: audienceId ? Number(audienceId) : undefined,
        tag: tag.trim() || undefined,
      });
      await loadCampaign();
      setSuccess("Recipients updated from audience/tag");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set recipients");
    } finally {
      setBusy(false);
    }
  }

  async function previewListRecipients() {
    const entries = pasteList.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
    if (!entries.length) {
      setError("Paste at least one email or phone number");
      return;
    }

    try {
      setBusy(true);
      setError("");
      const result = await api.setRecipientsFromList(campaignId, entries);
      setMatchPreview(result);
      await loadCampaign();
      setSuccess(result.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to match recipients");
    } finally {
      setBusy(false);
    }
  }

  async function sendNow() {
    if (!campaign?.recipients.length) {
      setError("Add at least one recipient before sending");
      return;
    }

    try {
      setBusy(true);
      setError("");
      await api.sendCampaign(campaignId);
      setSuccess("Campaign queued for sending");
      await loadCampaign();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send campaign");
    } finally {
      setBusy(false);
    }
  }

  async function scheduleSend() {
    const dateError = validateFutureDate(scheduledAt);
    if (dateError) {
      setError(dateError);
      return;
    }

    if (!campaign?.recipients.length) {
      setError("Add at least one recipient before scheduling");
      return;
    }

    try {
      setBusy(true);
      setError("");
      await api.sendCampaign(campaignId, new Date(scheduledAt).toISOString());
      setSuccess("Campaign scheduled");
      await loadCampaign();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to schedule campaign");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="page-title">Loading campaign…</div>;
  if (!campaign) return <div className="alert alert-error">Campaign not found</div>;

  const canEditRecipients = campaign.status === "draft" || campaign.status === "scheduled";
  const hasBeenSent = ["sending", "sent", "scheduled"].includes(campaign.status);

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/campaigns" className="text-sm" style={{ color: "var(--primary)" }}>← Back to campaigns</Link>
          <h1 className="page-title mt-2">{campaign.name}</h1>
          <p className="page-subtitle">{campaign.subject}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasBeenSent && (
            <Link href={`/campaigns/${campaignId}/analytics`} className="btn btn-primary">
              View performance →
            </Link>
          )}
          <span className={`badge badge-${campaign.status}`}>{campaign.status}</span>
        </div>
      </div>

      <CampaignNav active="setup" />

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">
          {success}
          {success.includes("queued") && (
            <span className="ml-2">
              <Link href={`/campaigns/${campaignId}/analytics`} style={{ color: "var(--primary)", fontWeight: 600 }}>
                Watch live analytics →
              </Link>
            </span>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Email preview</h2>
          <div className="text-sm mb-2" style={{ color: "var(--muted)" }}>Subject: {campaign.subject}</div>
          <div
            className="border rounded-lg p-4 bg-white text-sm prose max-w-none"
            dangerouslySetInnerHTML={{ __html: campaign.body }}
          />
        </div>

        <div className="space-y-6">
          {canEditRecipients && (
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Recipients</h2>
              <div className="tabs mb-4">
                <button className={`tab ${recipientTab === "audience" ? "tab-active" : ""}`} onClick={() => setRecipientTab("audience")}>Audience / Tag</button>
                <button className={`tab ${recipientTab === "list" ? "tab-active" : ""}`} onClick={() => setRecipientTab("list")}>Paste list</button>
              </div>

              {recipientTab === "audience" ? (
                <div className="space-y-3">
                  <select className="input" value={audienceId} onChange={(e) => setAudienceId(e.target.value)}>
                    <option value="">Select audience (optional)</option>
                    {audiences.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.memberCount ?? 0})</option>
                    ))}
                  </select>
                  <input className="input" placeholder="Or filter by tag (e.g. vip)" value={tag} onChange={(e) => setTag(e.target.value)} />
                  <button className="btn btn-primary w-full" onClick={applyAudienceRecipients} disabled={busy}>
                    Apply recipients
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    className="input min-h-[120px]"
                    placeholder="Paste emails or phone numbers, one per line"
                    value={pasteList}
                    onChange={(e) => setPasteList(e.target.value)}
                  />
                  <button className="btn btn-primary w-full" onClick={previewListRecipients} disabled={busy}>
                    Match & apply
                  </button>
                  {matchPreview && (
                    <div className="text-sm space-y-2 mt-3">
                      {matchPreview.matched.map((m) => (
                        <div key={m.entry} className="flex justify-between p-2 rounded" style={{ background: "var(--success-soft)" }}>
                          <span>{m.entry}</span>
                          <span style={{ color: "var(--muted)" }}>{m.name || m.email}</span>
                        </div>
                      ))}
                      {matchPreview.unmatched.map((u) => (
                        <div key={u} className="flex justify-between p-2 rounded" style={{ background: "var(--danger-soft)" }}>
                          <span>{u}</span>
                          <span style={{ color: "var(--danger)" }}>Not found</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {canEditRecipients && (
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Send</h2>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                {campaign.recipients.length} recipient(s) selected
              </p>
              <div className="flex flex-col gap-3">
                <button className="btn btn-primary" onClick={sendNow} disabled={busy || !campaign.recipients.length}>
                  Send now
                </button>
                <div className="flex gap-2">
                  <input type="datetime-local" className="input" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                  <button className="btn btn-secondary shrink-0" onClick={scheduleSend} disabled={busy || !campaign.recipients.length}>
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h2 className="font-semibold mb-3">Recipient list</h2>
            {campaign.recipients.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>No recipients yet</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {campaign.recipients.map((r) => (
                  <div key={r.id} className="flex justify-between text-sm p-2 rounded bg-slate-50">
                    <span>{r.email}</span>
                    <span className={`badge badge-${r.status === "pending" ? "draft" : r.status === "opened" ? "sent" : r.status}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
