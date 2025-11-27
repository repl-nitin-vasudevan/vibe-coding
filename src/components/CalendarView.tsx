"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTodos, Todo } from "@/context/TodoContext";

type ViewMode = "month" | "week";

function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day; // Adjust to get Sunday
  const weekStart = new Date(date);
  weekStart.setDate(diff);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatTime(dateString: string | null): string {
  if (!dateString) return "--:--";
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  // If time is midnight (00:00), it's a date-only todo
  if (hours === 0 && minutes === 0) {
    return "All day";
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T00:00:00`;
}

function getTodosForDate(todos: Todo[], date: Date): Todo[] {
  return todos
    .filter((todo) => {
      if (!todo.scheduledAt) return false;
      const todoDate = new Date(todo.scheduledAt);
      return isSameDay(todoDate, date);
    })
    .sort((a, b) => {
      if (!a.scheduledAt || !b.scheduledAt) return 0;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
}

function TodosForDate({ todos, date }: { todos: Todo[]; date: Date }) {
  const todosForDate = getTodosForDate(todos, date);

  if (todosForDate.length === 0) {
    return (
      <div className="mt-4 p-4 rounded-lg border border-dashed border-muted-foreground/30 text-center">
        <p className="text-sm text-muted-foreground">No tasks scheduled for this day</p>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full max-w-md">
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Tasks ({todosForDate.length})
          </h4>
        </div>
        <div className="divide-y">
          {todosForDate.map((todo, index) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30",
                index % 2 === 0 ? "bg-background" : "bg-muted/10"
              )}
            >
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-mono font-medium">
                  {formatTime(todo.scheduledAt)}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm font-medium flex-1">{todo.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeeklyView({
  selectedDate,
  onSelectDate,
  todos,
  onDayDrop,
}: {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
  todos: Todo[];
  onDayDrop: (date: Date) => void;
}) {
  const [weekStartDate, setWeekStartDate] = useState(new Date());
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const today = new Date();
  const weekDays = getWeekDays(weekStartDate);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setWeekStartDate(newDate);
  };

  const goToToday = () => {
    setWeekStartDate(new Date());
    onSelectDate(new Date());
  };

  // Get month/year display for the week
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const monthYearDisplay =
    firstDay.getMonth() === lastDay.getMonth()
      ? firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : `${firstDay.toLocaleDateString("en-US", { month: "short" })} - ${lastDay.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;

  // Count todos for each day
  const getTodoCount = (day: Date) => getTodosForDate(todos, day).length;

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverDay(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDay(null);
  };

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDay(null);
    onDayDrop(day);
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateWeek("prev")}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">{monthYearDisplay}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-sm"
          >
            Today
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateWeek("next")}
          className="h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
          const dayNumber = day.getDate();
          const todoCount = getTodoCount(day);
          const isDragOver = dragOverDay === index;

          return (
            <button
              key={index}
              onClick={() => onSelectDate(day)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
              className={cn(
                "flex flex-col items-center p-4 rounded-xl transition-all duration-200",
                "border-2 hover:border-primary/50 hover:bg-accent/50",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isDragOver && "ring-2 ring-primary bg-primary/20 border-primary",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:border-primary"
                  : isToday
                    ? "bg-accent border-primary/30"
                    : "bg-card border-border"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium mb-2",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {dayName}
              </span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  isSelected
                    ? "text-primary-foreground"
                    : isToday
                      ? "text-primary"
                      : "text-foreground"
                )}
              >
                {dayNumber}
              </span>
              {todoCount > 0 && (
                <div
                  className={cn(
                    "mt-2 px-2 py-0.5 rounded-full text-xs font-medium",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {todoCount} task{todoCount > 1 ? "s" : ""}
                </div>
              )}
              {isToday && !isSelected && todoCount === 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);
  const { todos, updateTodo, draggedTodoId, setDraggedTodoId } = useTodos();

  // Use a ref to always have the latest draggedTodoId value
  const draggedTodoIdRef = useRef<string | null>(null);
  const todosRef = useRef<Todo[]>([]);

  useEffect(() => {
    draggedTodoIdRef.current = draggedTodoId;
  }, [draggedTodoId]);

  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  // Clear hover state when drag ends
  useEffect(() => {
    if (!draggedTodoId) {
      setHoveredDateStr(null);
    }
  }, [draggedTodoId]);

  // Function to find which day is under the cursor
  const findDayUnderCursor = (x: number, y: number): string | null => {
    const dayButtons = document.querySelectorAll('[data-day]');
    let foundDateStr: string | null = null;

    dayButtons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const dateStr = btn.getAttribute('data-day');
        if (dateStr) {
          foundDateStr = dateStr;
        }
      }
    });

    return foundDateStr;
  };

  const handleDayDrop = async (date: Date) => {
    const currentDraggedId = draggedTodoIdRef.current;
    const currentTodos = todosRef.current;

    if (currentDraggedId) {
      const todo = currentTodos.find((t) => t.id === currentDraggedId);
      if (todo) {
        const scheduledAt = formatDateForApi(date);
        try {
          await updateTodo(currentDraggedId, todo.text, scheduledAt);
          setSelectedDate(date);
        } catch (error) {
          console.error("Failed to update todo:", error);
        }
        setDraggedTodoId(null);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* View Toggle */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg mb-6">
        <Button
          variant={viewMode === "month" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("month")}
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          Month
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("week")}
          className="gap-2"
        >
          <CalendarDays className="h-4 w-4" />
          Week
        </Button>
      </div>

      {/* Calendar Views */}
      {viewMode === "month" ? (
        <div className="relative">
          {/* Drop overlay - only visible during drag */}
          {draggedTodoId && (
            <div
              className="absolute inset-0 z-10 rounded-xl pointer-events-auto"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "move";
                // Track which day is under cursor
                const dateStr = findDayUnderCursor(e.clientX, e.clientY);
                if (dateStr !== hoveredDateStr) {
                  setHoveredDateStr(dateStr);
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                // Only clear if leaving the overlay entirely
                const rect = e.currentTarget.getBoundingClientRect();
                if (
                  e.clientX < rect.left ||
                  e.clientX > rect.right ||
                  e.clientY < rect.top ||
                  e.clientY > rect.bottom
                ) {
                  setHoveredDateStr(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setHoveredDateStr(null);

                const dateStr = findDayUnderCursor(e.clientX, e.clientY);
                if (dateStr) {
                  const foundDate = new Date(dateStr);
                  if (!isNaN(foundDate.getTime())) {
                    handleDayDrop(foundDate);
                  }
                }
              }}
            />
          )}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            onDayDrop={handleDayDrop}
            hoveredDateStr={hoveredDateStr}
            className={cn(
              "rounded-xl border-2 p-6 [--cell-size:3rem] text-lg shadow-lg",
              "bg-gradient-to-br from-background to-muted/30",
              draggedTodoId && "border-primary/50 shadow-primary/20"
            )}
            classNames={{
              month_caption: "text-xl font-bold flex justify-center pb-2",
              weekday: "text-sm font-semibold text-muted-foreground text-center w-[--cell-size]",
              weekdays: "flex justify-center gap-1",
              week: "flex justify-center gap-1 mt-1",
              day: "text-base flex-none w-[--cell-size] h-[--cell-size]",
            }}
          />
          {/* Drag hint */}
          {draggedTodoId && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-muted-foreground animate-pulse">
              Drop on a date to schedule
            </div>
          )}
        </div>
      ) : (
        <WeeklyView
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          todos={todos}
          onDayDrop={handleDayDrop}
        />
      )}

      {/* Selected Date Display */}
      {selectedDate && (
        <p className="mt-6 text-base text-muted-foreground">
          Selected: {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      {/* Todos for Selected Date */}
      {selectedDate && <TodosForDate todos={todos} date={selectedDate} />}
    </div>
  );
}
