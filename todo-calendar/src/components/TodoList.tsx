"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, GripVertical } from "lucide-react";
import { useTodos, Todo } from "@/context/TodoContext";

function formatDateTime(dateString: string | null): string {
  if (!dateString) return "No date set";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours();
  const minutes = date.getMinutes();
  // If time is midnight (00:00), show date only
  if (hours === 0 && minutes === 0) {
    return `${year}-${month}-${day}`;
  }
  return `${year}-${month}-${day} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getDateFromISO(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTimeFromISO(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Create a local date from date and time strings, return as ISO string (UTC)
function createLocalDateISO(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  // Create date using local timezone (month is 0-indexed)
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);
  return localDate.toISOString();
}

export function TodoList() {
  const { todos, isLoading, error: loadError, addTodo, updateTodo, deleteTodo, setDraggedTodoId } = useTodos();
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDate, setNewTodoDate] = useState("");
  const [newTodoTime, setNewTodoTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newTodoText.trim()) {
      setError("Please enter a todo description");
      return;
    }

    setIsSubmitting(true);
    let scheduledAt: string | undefined;
    if (newTodoDate) {
      // If time is provided, use it; otherwise default to midnight (date only)
      const time = newTodoTime || "00:00";
      scheduledAt = createLocalDateISO(newTodoDate, time);
    }

    try {
      await addTodo(newTodoText, scheduledAt);
      setNewTodoText("");
      setNewTodoDate("");
      setNewTodoTime("");
    } catch (err) {
      console.error("Failed to add todo:", err);
      setError(err instanceof Error ? err.message : "Failed to add todo");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditDate(getDateFromISO(todo.scheduledAt));
    setEditTime(getTimeFromISO(todo.scheduledAt));
  }

  function cancelEditing() {
    setEditingId(null);
    setEditText("");
    setEditDate("");
    setEditTime("");
  }

  async function handleUpdate(id: string) {
    if (!editText.trim()) {
      return;
    }

    let scheduledAt: string | undefined;
    if (editDate) {
      // If time is provided, use it; otherwise default to midnight (date only)
      const time = editTime || "00:00";
      scheduledAt = createLocalDateISO(editDate, time);
    }

    try {
      await updateTodo(id, editText, scheduledAt);
      cancelEditing();
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTodo(id);
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading todos...</p>;
  }

  if (loadError) {
    return <p className="text-red-500">{loadError}</p>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="text"
          placeholder="Add a new todo..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <Input
            type="date"
            value={newTodoDate}
            onChange={(e) => setNewTodoDate(e.target.value)}
            className="flex-1"
            placeholder="Date (optional)"
          />
          <Input
            type="time"
            value={newTodoTime}
            onChange={(e) => setNewTodoTime(e.target.value)}
            className="flex-1"
            placeholder="Time (optional)"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Date and time are optional (you can set just a date)</p>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>

      <ul className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-muted-foreground text-sm">No todos yet</p>
        ) : (
          todos.map((todo) => (
            <li
              key={todo.id}
              draggable={!todo.scheduledAt && editingId !== todo.id}
              onDragStart={(e) => {
                if (!todo.scheduledAt) {
                  // Set data for browser compatibility (required by some browsers)
                  e.dataTransfer.setData("text/plain", todo.id);
                  e.dataTransfer.effectAllowed = "move";
                  setDraggedTodoId(todo.id);
                }
              }}
              onDragEnd={() => {
                setDraggedTodoId(null);
              }}
              className={`p-3 rounded-lg border bg-card text-card-foreground ${
                !todo.scheduledAt && editingId !== todo.id
                  ? "cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-md transition-all"
                  : ""
              }`}
            >
              {editingId === todo.id ? (
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Date and time are optional (clear date to remove schedule)</p>
                  <div className="flex gap-2 justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(todo.id)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  {/* Drag handle for unscheduled todos */}
                  {!todo.scheduledAt && (
                    <div
                      className="flex items-center mr-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                      title="Drag to calendar to schedule"
                    >
                      <GripVertical className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{todo.text}</div>
                    <div className={`text-sm ${todo.scheduledAt ? 'text-muted-foreground' : 'text-muted-foreground/60 italic'}`}>
                      {formatDateTime(todo.scheduledAt)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEditing(todo)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(todo.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
