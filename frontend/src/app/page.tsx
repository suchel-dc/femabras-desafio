// page.tsx
"use client";
import { useState, useRef } from "react";
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import ChallengeSlot from "@/components/ChallengeSlot";
import DraggableNumber from "@/components/DraggableNumber";

export default function Home(){

  // Cofiguring draggable behaviors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 1,
      }
    })
  );

  // Slots now hold the whole object {id, val} or null
  const [slots, setSlots] = useState<(null | {id: string, val: string})[]>(Array(4).fill(null));
  // 1. An array of references to the input elements
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Temporal database to hold the numbers
  const availableNumbers = [{ id: "num-0", val: "1" }, { id: "num-1", val: "6" }, { id: "num-2", val: "2" }, { id: "num-3", val: "7" }, { id: "num-4", val: "8" }, { id: "num-5", val: "8" }, { id: "num-6", val: "4" }, { id: "num-7", val: "9" }, { id: "num-8", val: "5" }, { id: "num-9", val: "6" },];

  // Handling drag item function
  const handleDragEnd = (event: DragEndEvent) => {
    const {over, active} = event;

    // If the number is droped over a valid slot
    if (over && over.id.toString().startsWith("slot-")) {
      const slotIndex = parseInt(over.id.toString().split("-")[1]);

      // Getting the value from the availableNumbers list using the active.id
      const draggedItem = availableNumbers.find(n => n.id === active.id);

      if (draggedItem){
        const newSlots = [...slots];
        newSlots[slotIndex] = draggedItem;
        setSlots(newSlots);
      }
    }
  };

  // Function the handles slot's value removal
  const handleRemove = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
  }

  // Condition to see if the slots are filled
  const isComplete = slots.every(slot => slot !== null);

  // Function that handles manual input 
  const handleManualInput = (index: number, value: string) => {
    const typedValue = value.slice(-1);
    const foundItem = availableNumbers.find(n => n.val === typedValue && !slots.some(s => s?.id === n.id));
    
    if (foundItem) {
      const newSlots = [...slots];
      newSlots[index] = foundItem;
      setSlots(newSlots);

      // Auto-move to next slot if available after a valid input
      if (index < slots.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handles enter/return key when hitted
  const handleKeyDown = (keyboard: React.KeyboardEvent, index: number) => {
    // Moves focus on Enter/Return key press
    if (keyboard.key === "Enter" && index < slots.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Handle Backspace to move backward
    if (keyboard.key === "Backspace") {
      // If the current slot is empty and not the first one, the point courser moves back
      if (!slots[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } 
      // If the slot has a value, clearing it happens automatically via handleRemove
      // but we can force it here for a snappier feel
      else if (slots[index]) {
        handleRemove(index);
      }
    }
  }

  return(
    // Main section for the page
    <main className="flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden touch-none">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <h2 className="mb-12 font-bold tracking-widest opacity-80 text-2xl uppercase text-center">{ isComplete ? "Confirmar Sequência" : "Organize os numeros"}</h2>
        
        {/* The target slot */}
        <div className="flex gap-2 mb-12 flex-wrap justify-center max-w-93.75">
          {slots.map((slot, i) => (
            <div key={i} onClick={() => {
              if(slot) handleRemove(i)
              }
            }>
              <ChallengeSlot 
                indexOrder={i} 
                orderValue={slot?.val || ""}
                inputRef={(element) => (inputRefs.current[i] = element)} 
                onPlace={handleManualInput}
                onKeyDown={(key) => handleKeyDown(key, i)} 
              />
            </div>
          ))}
        </div>

        {/* The source number to drag from */}
        {/* DYNAMIC SECTION: tray number or buttons */}
        {!isComplete ? (

          // Shows the source tray number if not completed
          <div className="flex gap-6 flex-wrap justify-center max-w-93.75">
            {
              availableNumbers.map((item) => {
                // filtering out the used nomber by id
                const isUsed = slots.some(slot => slot?.id === item.id);
                if (isUsed) return null;
                return <DraggableNumber key={item.id} id={item.id} value={item.val} />}
              )
            }
          </div>
        ) : (
          /* Show the Control Buttons if complete */
          <div className="flex gap-4 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => {/* Logic to check against secret key */}}
              className="px-8 py-3 bg-foreground text-background font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              CONFIRMAR
            </button>
            
            <button 
              onClick={() => {
                  // Logic to "Edit" - perhaps clear the last slot or all slots?
                  setSlots(Array(4).fill(null)); 
              }}
              className="px-8 py-3 border-2 border-foreground text-foreground font-bold rounded-lg hover:bg-foreground/10 transition-colors"
            >
              EDITAR
            </button>
          </div>
        )}
      </DndContext>
    </main>
  );
}