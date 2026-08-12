import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'BRAND') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();
    
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const depositAmount = Number(amount);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Akun Anda tidak ditemukan di database. Silakan Logout dan Sign Up kembali." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { wallet_balance: { increment: depositAmount } }
      }),
      prisma.transactionLedger.create({
        data: {
          user_id: userId,
          amount: depositAmount,
          type: 'DEPOSIT',
        }
      })
    ]);

    return NextResponse.json({ 
      message: `Successfully deposited $${depositAmount.toFixed(2)} to your wallet! (Simulated)`
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
