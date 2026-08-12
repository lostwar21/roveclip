"use client";

import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WithdrawButton({ balance }: { balance: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleWithdraw = async () => {
    if (balance <= 0) {
      toast.error("Insufficient balance to withdraw.");
      return;
    }

    if (!confirm(`Tarik saldo sebesar Rp ${balance.toLocaleString('id-ID')} ke rekening Anda?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to withdraw");
      }
    } catch (e) {
      toast.error("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWithdraw}
      disabled={loading || balance <= 0}
      className="mt-4 px-4 py-2 bg-foreground text-background font-bold rounded-lg hover:bg-accent transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:shadow-none"
    >
      {loading ? "Processing..." : "Withdraw Funds"}
    </button>
  );
}
