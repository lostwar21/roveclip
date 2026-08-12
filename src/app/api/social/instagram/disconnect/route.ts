import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    await prisma.socialConnection.deleteMany({
      where: {
        user_id: userId,
        platform: "INSTAGRAM",
      }
    });

    return NextResponse.json({ success: true, message: "Instagram disconnected" });
  } catch (error) {
    console.error("Failed to disconnect Instagram:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
