"use client";

import { useState } from "react";

export default function LiveCheckButton({ url, platform }: { url: string, platform: string }) {
  const [loading, setLoading] = useState(false);
  const [views, setViews] = useState<number | null>(null);

  const checkViews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/check-views?url=${encodeURIComponent(url)}&platform=${platform}`);
      const data = await res.json();
      if (res.ok) {
        setViews(data.views);
      } else {
        alert(data.error || "Failed to fetch views");
      }
    } catch (e) {
      alert("Error fetching views");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center">
      {views !== null ? (
        <span className="text-xs bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded-lg font-mono font-bold animate-fade-in">
          Live: {views.toLocaleString()}
        </span>
      ) : (
        <button 
          onClick={checkViews}
          disabled={loading}
          className="text-xs bg-card hover:bg-border border border-border px-2 py-1 rounded-lg text-foreground/80 hover:text-foreground font-semibold transition-all shadow-sm"
        >
          {loading ? "Checking..." : "Check Live Views"}
        </button>
      )}
    </div>
  );
}
