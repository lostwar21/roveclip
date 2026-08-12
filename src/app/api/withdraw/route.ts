import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'CLIPPER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { wallet_balance: true }
    });

    if (!user || Number(user.wallet_balance) <= 0) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const amountToWithdraw = Number(user.wallet_balance);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { wallet_balance: 0 } // Kosongkan saldo
      }),
      prisma.transactionLedger.create({
        data: {
          user_id: userId,
          amount: -amountToWithdraw,
          type: 'WITHDRAWAL',
        }
      })
    ]);

    return NextResponse.json({ 
      message: `Successfully transferred $${amountToWithdraw.toFixed(2)} to your linked bank account! (Simulated)`
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
