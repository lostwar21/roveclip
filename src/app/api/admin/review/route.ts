import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized. Admins only." }, { status: 401 });
    }

    const { submission_id, action, valid_views } = await req.json();

    if (!submission_id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submission_id },
      include: { campaign: true }
    });

    if (!submission || submission.status !== 'MANUAL_REVIEW') {
      return NextResponse.json({ error: "Submission not found or already processed." }, { status: 400 });
    }

    if (action === 'REJECT') {
      await prisma.submission.update({
        where: { id: submission_id },
        data: { status: 'REJECTED' }
      });
      return NextResponse.json({ message: "Submission rejected successfully." });
    }

    if (action === 'APPROVE') {
      const views = Number(valid_views);
      if (isNaN(views) || views <= 0) {
        return NextResponse.json({ error: "Valid views must be a positive number." }, { status: 400 });
      }

      const deltaViews = views - submission.validated_views;
      if (deltaViews <= 0) {
        return NextResponse.json({ error: `Views yang dimasukkan (${views}) harus lebih besar dari views yang sudah tervalidasi sebelumnya (${submission.validated_views}).` }, { status: 400 });
      }

      const totalPayout = (deltaViews / 1000) * Number(submission.campaign.cpm_rate);
      
      const brand = await prisma.user.findUnique({ where: { id: submission.campaign.brand_id } });
      if (!brand || Number(brand.wallet_balance) < totalPayout) {
        return NextResponse.json({ error: "Brand does not have enough balance to pay for this many views." }, { status: 400 });
      }

      const platformFee = totalPayout * 0.20;
      const clipperPayout = totalPayout - platformFee;

      await prisma.$transaction([
        // Potong saldo brand
        prisma.user.update({
          where: { id: submission.campaign.brand_id },
          data: { wallet_balance: { decrement: totalPayout } }
        }),
        // Tambah saldo clipper
        prisma.user.update({
          where: { id: submission.clipper_id },
          data: { wallet_balance: { increment: clipperPayout } }
        }),
        // Catat pengeluaran brand
        prisma.transactionLedger.create({
          data: {
            user_id: submission.campaign.brand_id,
            reference_id: submission.id,
            amount: -totalPayout,
            type: 'PAYOUT'
          }
        }),
        // Catat penghasilan clipper (Net)
        prisma.transactionLedger.create({
          data: {
            user_id: submission.clipper_id,
            reference_id: submission.id,
            amount: clipperPayout,
            type: 'PAYOUT'
          }
        }),
        // Catat keuntungan RoveClip (Platform Fee) sebagai potongan dari clipper
        prisma.transactionLedger.create({
          data: {
            user_id: submission.clipper_id,
            reference_id: submission.id,
            amount: -platformFee,
            type: 'FEE'
          }
        }),
        // Update status submission
        prisma.submission.update({
          where: { id: submission.id },
          data: { 
            status: 'APPROVED',
            validated_views: views
          }
        })
      ]);

      return NextResponse.json({ message: `Approved! Platform earned $${platformFee.toFixed(2)}.` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
