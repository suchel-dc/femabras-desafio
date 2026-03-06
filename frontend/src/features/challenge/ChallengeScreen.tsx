"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import ChallengeSlot from "@/components/ChallengeSlot";
import DraggableNumber from "@/components/DraggableNumber";
import { env } from "@/lib/env";

const emptySubscribe = () => () => {};
const useIsMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

const ATTEMPTS_KEY = "femabras_attempts";
const MAX_ATTEMPTS = 5;
const SHAKE_DURATION_MS = 600;

const getTodayAttempts = (): number => {
  if (typeof window === "undefined") return MAX_ATTEMPTS;
  const today = new Date().toISOString().split("T")[0];
  const stored = localStorage.getItem(ATTEMPTS_KEY);
  if (!stored) return MAX_ATTEMPTS;
  try {
    const data = JSON.parse(stored);
    if (data.date === today) return data.remaining;
  } catch {
    return MAX_ATTEMPTS;
  }
  return MAX_ATTEMPTS;
};

const saveTodayAttempts = (remaining: number) => {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(
    ATTEMPTS_KEY,
    JSON.stringify({ date: today, remaining }),
  );
};

export default function ChallengeScreen() {
  const isMounted = useIsMounted();
  const [challenge, setChallenge] = useState<{
    slots: number;
    date: string;
    digits?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingAttempts, setRemainingAttempts] = useState(MAX_ATTEMPTS);
  const [hasWonToday, setHasWonToday] = useState(false);
  const [result, setResult] = useState<"success" | "incorrect" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [slots, setSlots] = useState<(null | { id: string; val: string })[]>(
    [],
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isMounted) return;
    setRemainingAttempts(getTodayAttempts());

    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${env.apiUrl}/challenge`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Offline");
        const data = await res.json();
        setChallenge(data);
        const slotCount = data.slots || 4;
        setSlots(Array(slotCount).fill(null));
        inputRefs.current = new Array(slotCount).fill(null);
      } catch (err: unknown) {
        // Silently log or handle error without crashing the build
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [isMounted]);

  const trayDigits = (challenge?.digits ?? []).map((val, index) => ({
    id: `digit-${index}`,
    val,
  }));
  const activeItem = trayDigits.find((d) => d.id === activeId);
  const isComplete = slots.length > 0 && slots.every((slot) => slot !== null);
  const showTray = !isComplete || isEditing;
  const canSubmit =
    isComplete && remainingAttempts > 0 && !hasWonToday && !submitting;

  const handleDragStart = (e: DragStartEvent) =>
    setActiveId(e.active.id as string);

  const handleDragEnd = (e: DragEndEvent) => {
    setIsEditing(false);
    setActiveId(null);
    const { over, active } = e;
    if (!over || !String(over.id).startsWith("slot-")) return;
    const slotIndex = parseInt(String(over.id).split("-")[1]);
    const draggedDigit = trayDigits.find((d) => d.id === active.id);
    if (!draggedDigit) return;
    const newSlots = [...slots];
    newSlots[slotIndex] = draggedDigit;
    setSlots(newSlots);
  };

  const handleRemove = (i: number) => {
    const newSlots = [...slots];
    newSlots[i] = null;
    setSlots(newSlots);
  };

  const handleManualInput = (index: number, value: string) => {
    const typed = value.slice(-1);
    if (!challenge?.digits?.includes(typed)) return;
    const found = { id: `manual-${Date.now()}`, val: typed };
    const newSlots = [...slots];
    newSlots[index] = found;
    setSlots(newSlots);
    if (index < slots.length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      if (!slots[index] && index > 0) inputRefs.current[index - 1]?.focus();
      else handleRemove(index);
    }
  };

  const handleTrayClick = (digit: { id: string; val: string }) => {
    const targetIndex = focusedIndex ?? slots.findIndex((s) => s === null);
    if (targetIndex === -1) return;
    const newSlots = [...slots];
    newSlots[targetIndex] = digit;
    setSlots(newSlots);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const guess = slots.map((s) => s?.val ?? "").join("");
    setSubmitting(true);
    try {
      const res = await fetch(`${env.apiUrl}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setResult("success");
        setHasWonToday(true);
        saveTodayAttempts(0);
      } else {
        setResult("incorrect");
        const nextAttempts = remainingAttempts - 1;
        setRemainingAttempts(nextAttempts);
        saveTodayAttempts(nextAttempts);
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          setSlots(Array(slots.length).fill(null));
        }, SHAKE_DURATION_MS);
      }
    } catch {
      // Error handling via UI status
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted || loading)
    return <main className="min-h-screen bg-background" />;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 touch-none overflow-hidden">
      <DndContext
        id="femabras-challenge"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <div className="mb-4 text-center text-[10px] sm:text-xs tracking-[0.2em] uppercase opacity-50">
          Oportunidades:{" "}
          <span
            className={
              remainingAttempts < 2
                ? "text-red-400 font-bold"
                : "text-green-400"
            }>
            {remainingAttempts} / {MAX_ATTEMPTS}
          </span>
        </div>

        <div className="text-center mb-8 sm:mb-10 px-2">
          <h2 className="font-bold text-2xl sm:text-4xl tracking-tight mb-2">
            {isComplete ? "Validar combinação" : "Decifre a sequência"}
          </h2>
          <p className="text-[10px] sm:text-sm opacity-40 italic">
            Dica: Os números podem repetir-se na sequência.
          </p>
        </div>

        <div className="flex gap-2 sm:gap-5 mb-10 sm:mb-12 justify-center max-w-full">
          {slots.map((slot, i) => (
            <div
              key={i}
              className={`${isShaking ? "shake-wrapper" : ""} scale-90 sm:scale-100`}
              onClick={() => handleRemove(i)}>
              <ChallengeSlot
                indexOrder={i}
                orderValue={slot?.val || ""}
                inputRef={(el) => (inputRefs.current[i] = el)}
                onPlace={handleManualInput}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setTimeout(() => setFocusedIndex(null), 100)}
                isShaking={isShaking}
              />
            </div>
          ))}
        </div>

        {showTray ? (
          <div className="flex gap-2 sm:gap-4 flex-wrap justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-sm sm:max-w-none">
            {trayDigits.map((digit) => (
              <div
                key={digit.id}
                className="scale-75 sm:scale-100 origin-center transition-transform hover:scale-110">
                <DraggableNumber
                  id={digit.id}
                  value={digit.val}
                  onClick={() => handleTrayClick(digit)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 animate-in zoom-in duration-300 w-full sm:w-auto px-6">
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-10 sm:px-14 py-4 sm:py-5 bg-foreground text-background font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm sm:text-base active:scale-95">
              {submitting ? "Verificando..." : "Confirmar"}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto px-10 sm:px-14 py-4 sm:py-5 border-2 border-foreground/20 text-foreground/80 font-bold rounded-2xl transition-all uppercase tracking-widest text-sm sm:text-base hover:bg-white/5">
              Revisar
            </button>
          </div>
        )}

        {result && (
          <div
            className={`mt-10 sm:mt-14 text-center text-sm sm:text-lg tracking-wide animate-in fade-in duration-1000 ${result === "success" ? "text-green-400" : "text-red-400"}`}>
            {result === "success"
              ? "✨ Excelente. Acesso concedido!"
              : remainingAttempts > 0
                ? "Quase lá! Tente uma nova combinação."
                : "Sequência bloqueada. Volte amanhã!"}
          </div>
        )}

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: "0.5",
                },
              },
            }),
          }}>
          {activeId ? (
            <div className="h-14 w-14 sm:h-20 sm:w-20 bg-foreground text-background flex items-center justify-center rounded-2xl text-2xl sm:text-4xl font-black shadow-[0_0_30px_10px_rgba(251,255,254,0.4)] scale-110 cursor-grabbing border border-white/20">
              {activeItem?.val}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
