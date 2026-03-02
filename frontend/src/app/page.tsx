// page.tsx
"use client";
import { useState } from "react";
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
  // Temporal database to hold the numbers
  const availableNumbers = [
    { id: "num-0", val: "1" }, { id: "num-1", val: "6" },
    { id: "num-2", val: "2" }, { id: "num-3", val: "7" },
    { id: "num-4", val: "8" }, { id: "num-5", val: "8" },
    { id: "num-6", val: "4" }, { id: "num-7", val: "9" },
    { id: "num-8", val: "5" }, { id: "num-9", val: "6" },
    
  ];

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

  return(
    // Main section for the page
    <main className="flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden touch-none">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <h2 className="mb-12 font-bold tracking-widest opacity-80">Organize os numeros</h2>
        
        {/* The target slot */}
        <div className="flex gap-4 mb-12 flex-wrap">
          {slots.map((slot, i) => (
            <div key={i} onClick={() => handleRemove(i)}>
              <ChallengeSlot 
                indexOrder={i} 
                orderValue={slot?.val || ""} 
                onPlace={() => {}} 
              />
            </div>
          ))}
        </div>

        {/* The source number to drag from */}
        <div className="flex gap-6 flex-wrap justify-center max-w-2xl">
          {
            availableNumbers.map((item) => {
              // filtering out the used nomber by id
              const isUsed = slots.some(slot => slot?.id === item.id);
              if (isUsed) return null;
              return <DraggableNumber key={item.id} id={item.id} value={item.val} />}
            )
          }
        </div>
      </DndContext>
    </main>
  );
}