"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type CampaignAnalytics = {
  campaignId: number;
  campaignName: string;
  status: string;
  totalRecipients: number;
  pending: number;
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
};

type Props = {
  campaignId: number;
  poll?: boolean;
  compact?: boolean;
};

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export default function CampaignAnalyticsPanel({
  campaignId,
  poll = true,
  compact = false,
}: Props) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await api.getCampaignAnalytics(campaignId);
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch {
      /* ignore transient errors while polling */
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (!poll || !analytics) return;
    if (analytics.status === "draft") return;

    const interval = setInterval(loadAnalytics, 4000);
    return () => clearInterval(interval);
  }, [poll, analytics, loadAnalytics]);

  if (loading && !analytics) {
    return <p style={{ color: "var(--muted)" }}>Loading analytics…</p>;
  }

  if (!analytics) {
    return <div className="alert alert-error">Could not load analytics</div>;
  }

  const total = analytics.totalRecipients || 0;
  const sentRate = pct(analytics.sent + analytics.delivered + analytics.opened, total);
  const deliveredRate = pct(analytics.delivered + analytics.opened, total);
  const openRate = pct(analytics.opened, total);

  if (compact) {
    return (
      <div className="stat-grid">
        <MetricCard label="Sent" value={analytics.sent + analytics.delivered + analytics.opened} total={total} color="var(--primary)" />
        <MetricCard label="Delivered" value={analytics.delivered + analytics.opened} total={total} color="var(--success)" />
        <MetricCard label="Opened" value={analytics.opened} total={total} color="#7c3aed" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Campaign performance</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Sent, delivered, and opened counts from provider webhooks
          </p>
        </div>
        {poll && analytics.status !== "draft" && (
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--success)" }}>
            <span className="live-dot" />
            Live · refreshes every 4s
            {lastUpdated && (
              <span style={{ color: "var(--muted)" }}>
                · updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <HeroMetric
          label="Sent"
          value={analytics.sent + analytics.delivered + analytics.opened}
          total={total}
          rate={sentRate}
          color="var(--primary)"
          bg="var(--primary-soft)"
        />
        <HeroMetric
          label="Delivered"
          value={analytics.delivered + analytics.opened}
          total={total}
          rate={deliveredRate}
          color="var(--success)"
          bg="var(--success-soft)"
        />
        <HeroMetric
          label="Opened"
          value={analytics.opened}
          total={total}
          rate={openRate}
          color="#7c3aed"
          bg="#f5f3ff"
        />
      </div>

      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total recipients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.failed}</div>
          <div className="stat-label">Failed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value capitalize">{analytics.status}</div>
          <div className="stat-label">Campaign status</div>
        </div>
      </div>

      {analytics.status === "draft" && (
        <div className="alert" style={{ background: "var(--warning-soft)", border: "1px solid #fde68a", color: "#92400e" }}>
          Send this campaign first — analytics will appear here and update automatically once emails go out.
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label} of {total}</div>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  total,
  rate,
  color,
  bg,
}: {
  label: string;
  value: number;
  total: number;
  rate: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="card p-6" style={{ background: bg, borderColor: "transparent" }}>
      <div className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color }}>
        {label}
      </div>
      <div className="text-4xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        of {total} recipients · {rate}%
      </div>
      <div className="h-2 rounded-full bg-white/70 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${rate}%`, background: color }}
        />
      </div>
    </div>
  );
}
