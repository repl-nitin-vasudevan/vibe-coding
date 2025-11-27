import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Ensure dates are serialized as ISO strings consistently
function serializeTodo(todo: {
  id: string;
  text: string;
  scheduledAt: Date | null;
  completed: boolean;
  createdAt: Date;
}) {
  return {
    ...todo,
    scheduledAt: todo.scheduledAt ? todo.scheduledAt.toISOString() : null,
    createdAt: todo.createdAt.toISOString(),
  };
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const { text, scheduledAt } = body;

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  let scheduledDate: Date | null = null;
  if (scheduledAt) {
    scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date/time format" },
        { status: 400 }
      );
    }
  }

  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: {
        text,
        scheduledAt: scheduledDate,
      },
    });
    return NextResponse.json(serializeTodo(todo));
  } catch {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.todo.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
}
