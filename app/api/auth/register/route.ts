import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { username, email, password } = await req.json();
        if (!username || !email || !password) return NextResponse.json({ error: "Username, Email and password are required" }, { status: 400 });

        const existingUser = await prisma.user.findFirst({ where: { email: email } });

        if (existingUser) {
            if (existingUser.emailVerified) {
                return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
            } else {
                // User exists but not verified. Update password and resend verification.
                const hashed = await bcrypt.hash(password, 10);

                await prisma.$transaction(async (tx) => {
                    await tx.user.update({
                        where: { email: email },
                        data: { password: hashed }
                    });

                    // Delete existing tokens for this user to avoid clutter
                    await tx.verificationToken.deleteMany({
                        where: { identifier: email }
                    });

                    const token = crypto.randomBytes(32).toString("hex");
                    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                    await tx.verificationToken.create({
                        data: {
                            identifier: email,
                            token,
                            expires,
                        }
                    });

                    await sendVerificationEmail(email, token);
                });

                return NextResponse.json({ message: "Verification email resent. Please check your inbox." }, { status: 200 });
            }
        }

        const hashed = await bcrypt.hash(password, 10);

        // Transaction to ensure both user and token are created
        await prisma.$transaction(async (tx) => {
            await tx.user.create({
                data: {
                    name: username,
                    email: email,
                    password: hashed,
                    image: `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`,
                }
            });
            const token = crypto.randomBytes(32).toString("hex");
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            await tx.verificationToken.create({
                data: {
                    identifier: email,
                    token,
                    expires,
                }
            });

            await sendVerificationEmail(email, token);
        });

        return NextResponse.json({ message: "User registered successfully. Please check your email to verify your account." }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
    }
}