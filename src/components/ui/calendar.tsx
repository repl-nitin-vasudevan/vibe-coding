"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

// Context to pass drop handler to day buttons
const CalendarDropContext = React.createContext<{
  onDayDrop?: (date: Date) => void;
  dragOverDate?: Date | null;
  setDragOverDate?: (date: Date | null) => void;
  hoveredDateStr?: string | null;
}>({});

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  onDayDrop,
  hoveredDateStr,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  onDayDrop?: (date: Date) => void
  hoveredDateStr?: string | null
}) {
  const defaultClassNames = getDefaultClassNames()
  const [dragOverDate, setDragOverDate] = React.useState<Date | null>(null);

  return (
    <CalendarDropContext.Provider value={{ onDayDrop, dragOverDate, setDragOverDate, hoveredDateStr }}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
          className
        )}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("default", { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-fit", defaultClassNames.root),
          months: cn(
            "relative flex flex-col gap-4 md:flex-row",
            defaultClassNames.months
          ),
          month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
          nav: cn(
            "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: buttonVariant }),
            "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant }),
            "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
            defaultClassNames.month_caption
          ),
          dropdowns: cn(
            "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
            defaultClassNames.dropdowns
          ),
          dropdown_root: cn(
            "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
            defaultClassNames.dropdown_root
          ),
          dropdown: cn(
            "bg-popover absolute inset-0 opacity-0",
            defaultClassNames.dropdown
          ),
          caption_label: cn(
            "select-none font-medium",
            captionLayout === "label"
              ? "text-sm"
              : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
            defaultClassNames.caption_label
          ),
          table: "w-full border-collapse",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn(
            "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
            defaultClassNames.weekday
          ),
          week: cn("mt-2 flex w-full", defaultClassNames.week),
          week_number_header: cn(
            "w-[--cell-size] select-none",
            defaultClassNames.week_number_header
          ),
          week_number: cn(
            "text-muted-foreground select-none text-[0.8rem]",
            defaultClassNames.week_number
          ),
          day: cn(
            "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
            defaultClassNames.day
          ),
          range_start: cn(
            "bg-accent rounded-l-md",
            defaultClassNames.range_start
          ),
          range_middle: cn("rounded-none", defaultClassNames.range_middle),
          range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
          today: cn(
            "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
            defaultClassNames.today
          ),
          outside: cn(
            "text-muted-foreground aria-selected:text-muted-foreground",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-muted-foreground opacity-50",
            defaultClassNames.disabled
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            const handleRootDragOver = (e: React.DragEvent) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            };

            const handleRootDrop = (e: React.DragEvent) => {
              e.preventDefault();
              // Find the closest button with data-day attribute
              const target = e.target as HTMLElement;
              const dayButton = target.closest('[data-day]') as HTMLElement;

              if (dayButton && onDayDrop) {
                const dateStr = dayButton.getAttribute('data-day');
                if (dateStr) {
                  const date = new Date(dateStr);
                  if (!isNaN(date.getTime())) {
                    onDayDrop(date);
                  }
                }
              }
            };

            return (
              <div
                data-slot="calendar"
                ref={rootRef}
                className={cn(className)}
                onDragOver={handleRootDragOver}
                onDrop={handleRootDrop}
                {...props}
              />
            )
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (
                <ChevronLeftIcon className={cn("size-4", className)} {...props} />
              )
            }

            if (orientation === "right") {
              return (
                <ChevronRightIcon
                  className={cn("size-4", className)}
                  {...props}
                />
              )
            }

            return (
              <ChevronDownIcon className={cn("size-4", className)} {...props} />
            )
          },
          DayButton: CalendarDayButton,
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div className="flex size-[--cell-size] items-center justify-center text-center">
                  {children}
                </div>
              </td>
            )
          },
          ...components,
        }}
        {...props}
      />
    </CalendarDropContext.Provider>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()
  const { onDayDrop, dragOverDate, setDragOverDate, hoveredDateStr } = React.useContext(CalendarDropContext);

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  // Check if this day matches the hovered date string from the overlay
  const dayDateStr = day.date.toLocaleDateString();
  const isHoveredFromOverlay = hoveredDateStr === dayDateStr;

  const isDragOver = isHoveredFromOverlay || (dragOverDate &&
    dragOverDate.getFullYear() === day.date.getFullYear() &&
    dragOverDate.getMonth() === day.date.getMonth() &&
    dragOverDate.getDate() === day.date.getDate());

  const handleDragOver = (e: React.DragEvent) => {
    if (onDayDrop) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      setDragOverDate?.(day.date);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDate?.(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDate?.(null);
    if (onDayDrop) {
      onDayDrop(day.date);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        "hover:bg-accent hover:text-accent-foreground hover:scale-105",
        "h-9 w-9",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:shadow-md data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-lg data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-lg group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        isDragOver && "ring-2 ring-primary bg-primary/30 scale-110 shadow-lg shadow-primary/30 z-10",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
