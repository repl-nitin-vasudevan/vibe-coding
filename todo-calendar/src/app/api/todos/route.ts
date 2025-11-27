import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const todos = await prisma.todo.findMany({
    orderBy: [
      { scheduledAt: { sort: "asc", nulls: "last" } },
      { createdAt: "asc" },
    ],
  });
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { text, scheduledAt } = body;

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  let scheduledDate: Date | null = null;
  if (scheduledAt) {
    scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: "Invalid date/time format" }, { status: 400 });
    }
  }

  const todo = await prisma.todo.create({
    data: {
      text,
      scheduledAt: scheduledDate,
    },
  });

  return NextResponse.json(todo, { status: 201 });
}
