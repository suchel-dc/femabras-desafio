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
        delay: 100,
        tolerance: 5,
      }
    })
  );

  // Temporal database to hold the numbers
  const [sequenceNumber, setSequenceNumber] = useState(["", "", "", ""]);
  const availableNumber = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  // Handling drag item function
  const handleDragEnd = (event: DragEndEvent) => {
    const {over, active} = event;

    // If the number is droped over a valid slot
    if (over && over.id.toString().startsWith("slot-")) {
      const slotIndex = parseInt(over.id.toString().split("-")[1]);
      const value = active.id.toString();

      const newSequenceNumber = [...sequenceNumber];
      newSequenceNumber[slotIndex] = value.slice(-1);
      setSequenceNumber(newSequenceNumber);
    }
  }

  return(
    // Main section for the page
    <main className="flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden touch-none">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <h2 className="mb-12 font-bold tracking-widest opacity-80">Organize os numeros</h2>
        
        {/* The target slot */}
        <div className="flex gap-4 mb-12">
          {sequenceNumber.map((val, i) => (
            <ChallengeSlot 
              key={`slot-${i}`} 
              indexOrder={i} 
              orderValue={val} 
              onPlace={(index, value) => {
                const newSequence = [...sequenceNumber];
                newSequence[index] = value;
                setSequenceNumber(newSequence);
              }} 
            />
          ))}
        </div>

        {/* The source number to drag from */}
        <div className="flex gap-6">
          {
            availableNumber.map((mapNumber) => (
              <DraggableNumber key={mapNumber} id={mapNumber}/>
            ))
          }
        </div>
      </DndContext>
    </main>
  );
}