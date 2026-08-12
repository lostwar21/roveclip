"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReviewModal({ 
  submissionId, 
  cpmRate, 
  initialUrl,
  platform 
}: { 
  submissionId: string, 
  cpmRate: number, 
  initialUrl: string,
  platform: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [views, setViews] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Live stats states
  const [fetchingStats, setFetchingStats] = useState(false);
  const [liveViews, setLiveViews] = useState<number | null>(null);
  const [liveError, setLiveError] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchLiveStats();
    } else {
      // Clear state on close
      setLiveViews(null);
      setLiveError("");
    }
  }, [isOpen]);

  const fetchLiveStats = async () => {
    setFetchingStats(true);
    setLiveError("");
    try {
      const res = await fetch(`/api/admin/check-views?url=${encodeURIComponent(initialUrl)}&platform=${platform}`);
      const data = await res.json();
      if (res.ok) {
        setLiveViews(data.views);
      } else {
        setLiveError(data.error || "Failed to fetch live stats.");
      }
    } catch (err) {
      setLiveError("Error connecting to scraper.");
    } finally {
      setFetchingStats(false);
    }
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE' && (!views || Number(views) <= 0)) {
      alert("Please enter a valid number of views to approve.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          action,
          valid_views: action === 'APPROVE' ? Number(views) : undefined
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setIsOpen(false);
        router.refresh();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-orange-500 text-background font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg text-xs md:text-sm"
      >
        Review
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card p-6 rounded-2xl border border-orange-500/30 shadow-2xl w-full max-w-md text-left">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-orange-500">🛡️</span> Manual Review
            </h2>
            
            <div className="mb-4 space-y-1">
              <p className="text-sm text-foreground/70">Verify this video manually:</p>
              <a href={initialUrl} target="_blank" rel="noreferrer" className="text-accent underline break-all text-sm block">
                {initialUrl}
              </a>
              <span className="inline-block text-xs bg-card/60 px-2 py-0.5 rounded border border-border mt-1">
                Platform: {platform}
              </span>
            </div>

            {/* Live Stats Fetching Box */}
            <div className="bg-background/80 border border-border rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold tracking-wider text-foreground/60 uppercase">Live Internet Data</span>
                {fetchingStats && <span className="text-xs text-orange-500 animate-pulse">Scraping live video...</span>}
              </div>
              
              {fetchingStats ? (
                <div className="h-10 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : liveError ? (
                <div className="text-xs text-red-500 flex justify-between items-center">
                  <span>{liveError}</span>
                  <button onClick={fetchLiveStats} className="text-accent underline ml-2 font-bold">Retry</button>
                </div>
              ) : liveViews !== null ? (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-foreground font-mono">{liveViews.toLocaleString()}</span>
                    <span className="text-xs text-foreground/60 ml-1">views</span>
                  </div>
                  <button 
                    onClick={() => setViews(liveViews.toString())}
                    className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-lg hover:bg-orange-500 hover:text-background font-bold transition-all"
                  >
                    Auto-Fill Views
                  </button>
                </div>
              ) : (
                <p className="text-xs text-foreground/50">No data loaded.</p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Enter Validated Views</label>
                <input 
                  type="number"
                  min="1"
                  value={views}
                  onChange={(e) => setViews(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:border-orange-500"
                  placeholder="e.g. 150000"
                />
                <p className="text-xs text-foreground/50 mt-1">
                  Payout to Process: <span className="font-bold text-foreground">${views ? ((Number(views)/1000) * cpmRate).toFixed(2) : "0.00"}</span>
                </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => handleAction('REJECT')}
                  disabled={loading}
                  className="flex-1 py-3 border border-red-500/50 text-red-500 font-semibold rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-50 text-sm"
                >
                  Reject Fraud
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAction('APPROVE')}
                  disabled={loading}
                  className="flex-1 py-3 bg-orange-500 text-background font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-orange-500/20 text-sm"
                >
                  {loading ? "Processing..." : "Approve Payout"}
                </button>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                className="w-full mt-2 py-2 text-sm text-foreground/50 hover:text-foreground transition-colors text-center block"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
