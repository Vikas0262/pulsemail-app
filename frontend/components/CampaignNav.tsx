"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function CampaignNav({ active }: { active: "setup" | "analytics" }) {
  const params = useParams();
  const id = params.id;

  return (
    <div className="tabs mb-6">
      <Link
        href={`/campaigns/${id}`}
        className={`tab ${active === "setup" ? "tab-active" : ""}`}
        style={{ textDecoration: "none" }}
      >
        Setup
      </Link>
      <Link
        href={`/campaigns/${id}/analytics`}
        className={`tab ${active === "analytics" ? "tab-active" : ""}`}
        style={{ textDecoration: "none" }}
      >
        Performance
      </Link>
    </div>
  );
}
