"use client";

import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClaimButton({ submissionId, status }: { submissionId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (status === 'MANUAL_REVIEW') {
    return <span className="text-xs text-foreground/50 bg-background px-2 py-1 rounded">In Review</span>;
  }

  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/claim`, { method: "POST" });
      const data = await res.json();
      toast.success(data.message || data.error || "Claim processed!");
      router.refresh();
    } catch (e) {
      toast.error("Error processing claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClaim}
      disabled={loading}
      className="px-4 py-2 bg-foreground text-background font-semibold rounded-md hover:bg-accent transition-all hover:shadow-[0_0_10px_var(--color-accent)] disabled:opacity-50 text-xs"
    >
      {loading ? "..." : "Claim Payout"}
    </button>
  );
}
