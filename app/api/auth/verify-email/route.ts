
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    try {
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }

        if (new Date() > verificationToken.expires) {
            return NextResponse.json({ error: "Token expired" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: verificationToken.identifier },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { email: verificationToken.identifier },
                data: { emailVerified: new Date() },
            }),
            prisma.verificationToken.delete({
                where: { token },
            }),
        ]);

        return NextResponse.json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
