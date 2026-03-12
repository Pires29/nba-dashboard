export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../../prisma/prismaClient";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "Campos em falta" }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json(
        { error: "Password deve ter pelo menos 8 caracteres" },
        { status: 400 },
      );

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 },
      );

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
