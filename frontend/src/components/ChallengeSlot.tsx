"use client";
import { useDroppable } from "@dnd-kit/core";

interface SlotProps {
  indexOrder: number;
  orderValue: string;
  onPlace: (indexOrder: number, orderValue: string) => void;
  onKeyDown: (key: React.KeyboardEvent) => void;
  inputRef: (element: HTMLInputElement | null) => void;
  onFocus: () => void;
  onBlur: () => void;
  isShaking?: boolean;
}

export default function ChallengeSlot({
  indexOrder,
  orderValue,
  onPlace,
  onKeyDown,
  inputRef,
  onFocus,
  onBlur,
  isShaking = false, // default false
}: SlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${indexOrder}`,
  });

  const hasValue = orderValue !== "";

  // During shake: force transparent background + red border
  const forcedStyle = isShaking
    ? {
        backgroundColor: "transparent !important",
        borderColor: "#ef4444 !important",
        borderWidth: "3px !important",
      }
    : {};

  const style = {
    borderColor: isOver
      ? "var(--foreground)"
      : hasValue && !isShaking // ← don't apply foreground border during shake
        ? "var(--foreground)"
        : "gray",
    backgroundColor:
      hasValue && !isShaking // ← disable filled bg during shake
        ? "var(--foreground)"
        : isOver
          ? "rgba(var(--foreground-rgb), 0.1)"
          : "transparent",
    color: hasValue && !isShaking ? "var(--background)" : "var(--foreground)",
    ...forcedStyle, // override with shake styles
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex w-full max-w-20 aspect-4/5 items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-transparent transition-colors duration-300">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        value={orderValue}
        onKeyDown={onKeyDown}
        onFocus={(e) => {
          e.target.select();
          onFocus();
        }}
        onBlur={onBlur}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onPlace(indexOrder, e.target.value)}
        className={`h-full w-full bg-transparent text-center text-2xl sm:text-4xl font-bold uppercase outline-none ${
          hasValue && !isShaking ? "text-background" : "text-foreground"
        }`}
        placeholder="?"
      />
      <div className="absolute inset-0 pointer-events-none" />
    </div>
  );
}
