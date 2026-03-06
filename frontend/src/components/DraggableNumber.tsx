"use client";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableProps {
  id: string;
  value: string;
  onClick?: () => void;
  classNameExtra?: string;
}

export default function DraggableNumber({
  id,
  value,
  onClick,
  classNameExtra = "",
}: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  // Dynamically calculate the box-shadow for the glowing effect
  const glowColor = "rgba(251, 255, 254, 0.1)"; // light-greenish color with opacity
  const boxShadowStyle = isDragging
    ? `0 0 25px 8px ${glowColor}` // Strong glow while dragging
    : "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)"; // Default shadow

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transform
      ? "none"
      : "transform 200ms ease, box-shadow 300ms ease",
    zIndex: transform ? 999 : 1,
    opacity: isDragging ? 0 : 1, // Keep original logic to hide the source item
    touchAction: "none",
    WebkitUserDrag: "none",
    boxShadow: boxShadowStyle, // Apply the glowing effect
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`flex h-16 w-16 select-none cursor-grab items-center justify-center rounded-full bg-foreground text-background text-2xl font-black active:cursor-grabbing active:scale-110 ${classNameExtra}`}>
      {value}
    </div>
  );
}
