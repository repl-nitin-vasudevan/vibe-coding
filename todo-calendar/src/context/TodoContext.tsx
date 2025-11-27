"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Todo {
  id: string;
  text: string;
  scheduledAt: string | null;
  completed: boolean;
  createdAt: string;
}

interface TodoContextType {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  addTodo: (text: string, scheduledAt?: string) => Promise<void>;
  updateTodo: (id: string, text: string, scheduledAt?: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  refreshTodos: () => Promise<void>;
  // Drag state
  draggedTodoId: string | null;
  setDraggedTodoId: (id: string | null) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    // Todos with dates come first, sorted by date
    // Todos without dates come last, sorted by createdAt
    if (a.scheduledAt && b.scheduledAt) {
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    }
    if (a.scheduledAt && !b.scheduledAt) return -1;
    if (!a.scheduledAt && b.scheduledAt) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null);

  async function fetchTodos() {
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      setError("Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  async function addTodo(text: string, scheduledAt?: string) {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, scheduledAt: scheduledAt || null }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to add todo");
    }

    const newTodo = await response.json();
    setTodos((prev) => sortTodos([...prev, newTodo]));
  }

  async function updateTodo(id: string, text: string, scheduledAt?: string) {
    const response = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, scheduledAt: scheduledAt || null }),
    });

    if (!response.ok) {
      throw new Error("Failed to update todo");
    }

    const updatedTodo = await response.json();
    setTodos((prev) =>
      sortTodos(prev.map((todo) => (todo.id === id ? updatedTodo : todo)))
    );
  }

  async function deleteTodo(id: string) {
    const response = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete todo");
    }

    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  return (
    <TodoContext.Provider
      value={{
        todos,
        isLoading,
        error,
        addTodo,
        updateTodo,
        deleteTodo,
        refreshTodos: fetchTodos,
        draggedTodoId,
        setDraggedTodoId,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodos must be used within a TodoProvider");
  }
  return context;
}
