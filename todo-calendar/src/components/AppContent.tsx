"use client";

import { TodoList } from "@/components/TodoList";
import { CalendarView } from "@/components/CalendarView";
import { ResizableLayout } from "@/components/ResizableLayout";
import { TodoProvider } from "@/context/TodoContext";

export function AppContent() {
  return (
    <TodoProvider>
      <ResizableLayout
        leftPanel={
          <>
            <h2 className="text-xl font-semibold mb-4">Todo List</h2>
            <TodoList />
          </>
        }
        rightPanel={
          <>
            <h2 className="text-xl font-semibold mb-4">Calendar</h2>
            <CalendarView />
          </>
        }
      />
    </TodoProvider>
  );
}
