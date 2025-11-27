"use client";

import { useState, useRef, useCallback, useEffect, ReactNode } from "react";

interface ResizableLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function ResizableLayout({ leftPanel, rightPanel }: ResizableLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(384); // Default ~w-96 (24rem = 384px)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const minWidth = containerWidth / 4; // Minimum 1/4 of container
      const maxWidth = containerWidth * 0.5; // Maximum 50% of container

      // Calculate new width based on mouse position relative to container
      const newWidth = e.clientX - containerRect.left;

      // Clamp between min and max
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      setSidebarWidth(clampedWidth);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <>
      {/* Mobile Layout - stacked vertically without resizable divider */}
      <div className="flex flex-col md:hidden h-screen">
        <aside className="w-full border-b border-border bg-muted/30 p-4 overflow-y-auto">
          {leftPanel}
        </aside>
        <main className="flex-1 p-4 overflow-y-auto">
          {rightPanel}
        </main>
      </div>

      {/* Desktop Layout - side by side with resizable divider */}
      <div
        ref={containerRef}
        className="hidden md:flex flex-row h-screen"
      >
        {/* Sidebar */}
        <aside
          className="bg-muted/30 p-4 overflow-y-auto flex-shrink-0"
          style={{ width: sidebarWidth }}
        >
          {leftPanel}
        </aside>

        {/* Draggable Divider */}
        <div
          onMouseDown={handleMouseDown}
          className={`w-1 cursor-col-resize transition-colors duration-150 flex-shrink-0 ${
            isDragging
              ? "bg-primary"
              : "bg-border hover:bg-primary/50"
          }`}
        />

        {/* Main Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {rightPanel}
        </main>
      </div>
    </>
  );
}
