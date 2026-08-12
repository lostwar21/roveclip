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

    const { video_url, cpm_rate, total_budget } = await req.json();
    
    if (!video_url || !cpm_rate || !total_budget) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const cpm = Number(cpm_rate);
    const budget = Number(total_budget);

    if (cpm <= 0 || budget <= 0) {
      return NextResponse.json({ error: "Rates must be greater than zero" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { wallet_balance: true }
    });

    if (!user || Number(user.wallet_balance) < budget) {
      return NextResponse.json({ error: "Insufficient wallet balance for this total budget" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        brand_id: userId,
        video_url,
        cpm_rate: cpm,
        total_budget: budget,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({ 
      message: "Campaign created successfully!",
      campaign 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
