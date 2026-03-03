// page.tsx
"use client";
import { useState, useRef, useSyncExternalStore } from "react";
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent, 
  PointerSensor, 
  TouchSensor, 
  useSensor, 
  useSensors, 
  DragOverlay 
} from "@dnd-kit/core";
import ChallengeSlot from "@/components/ChallengeSlot";
import DraggableNumber from "@/components/DraggableNumber";

// Dummy store that returns false on the server and true on the client
const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client value
    () => false  // Server (SSR) value
  );
}

export default function Home(){
  const isMounted = useIsMounted();


  // Cofiguring draggable behaviors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      }
    })
  );

  // Add this state to track what is currently being dragged
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Slots now hold the whole object {id, val} or null
  const [slots, setSlots] = useState<(null | {id: string, val: string})[]>(Array(4).fill(null));
  
  // An array of references to the input elements
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // To get into edit mode
  const [isEditing, setIsEditing] = useState(false);

  // State to track the cursor
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  
  // Temporal database to hold the numbers
  const availableNumbers = [{ id: "num-0", val: "1" }, { id: "num-1", val: "6" }, { id: "num-2", val: "2" }, { id: "num-3", val: "7" }, { id: "num-4", val: "8" }, { id: "num-5", val: "8" }, { id: "num-6", val: "4" }, { id: "num-7", val: "9" }, { id: "num-8", val: "5" }, { id: "num-9", val: "6" },];

  // Handling drag item function
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setIsEditing(false); //To turn off edit mode once a change is made
    setActiveId(null); // to reset when done
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
  }
  
  // To find the active item to show in the overlay
  const activeItem = availableNumbers.find(n => n.id === activeId);

  // Function the handles slot's value removal
  const handleRemove = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
  }

  // Condition to see if the slots are filled
  const isComplete = slots.every(slot => slot !== null);

  // Condition to alow the tray to come back when edit button is clicked
  const showTray = !isComplete || isEditing;

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

  // Handling clicks on the tray
  const handleTrayClick = (item: {id: string, val: string}) => {

    const newSlots = [...slots];
    const targetIndex = focusedIndex !== null ? focusedIndex : slots.findIndex(s => s === null);
    if (targetIndex !== -1) {
      newSlots[targetIndex] = item;
      setSlots(newSlots);
      
      // Clears the focus or move it forward
      setFocusedIndex(null); 
      setIsEditing(false);
    }
  };

  // Handling edit butto behaviour
  const handleEdit = () => {
    setIsEditing(true);
    // To force focus to the last slot (index 3)
    setTimeout(() => {
      inputRefs.current[3]?.focus();
    }, 10); // Small timeout to ensure the element is focusable after state change
  };

  // Use the hook to guard the render
  if (!isMounted) return <main className="min-h-screen bg-background" />;

  return(
    // Main section for the page
    <main className="flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden touch-none">
      <DndContext
        id="femabras-challenge" 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <h2 className="mb-12 font-bold tracking-widest opacity-80 text-2xl uppercase text-center">{ isComplete ? "Confirmar Sequência" : "Organize os numeros"}</h2>
        
        {/* The target slot */}
        <div className="flex flew-row justify-center gap-2 sm:gap-4 mb-12 w-full max-w-md px-2 overflow-visible">
          {slots.map((slot, i) => (
            <div
              className="flex-1 max-w-20"
              key={i}
              onClick={() => {
                if(slot) handleRemove(i)
              }
            }>
              <ChallengeSlot 
                indexOrder={i} 
                orderValue={slot?.val || ""}
                inputRef={(element) => (inputRefs.current[i] = element)} 
                onPlace={handleManualInput}
                onKeyDown={(key) => handleKeyDown(key, i)}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setTimeout(() => setFocusedIndex(null), 100)}
              />
            </div>
          ))}
        </div>

        {/* The source number to drag from */}
        {/* DYNAMIC SECTION: tray number or buttons */}
        {showTray ? (

          // This shows the tray if the numbers are not completed or if edit button was clicked
          <div className="flex gap-6 flex-wrap justify-center max-w-93.75 max-h-70 overflow-y-auto p-4 scrollbar-hide overscroll-behavior-contain">
            {
              availableNumbers.map((item) => {
                // filtering out the used nomber by id
                const isUsed = slots.some(slot => slot?.id === item.id);
                if (isUsed) return null;
                return <DraggableNumber 
                  key={item.id} 
                  id={item.id} 
                  value={item.val}
                  onClick={() => {
                    handleTrayClick(item);
                    setIsEditing(false);  
              }}/>;
            })}
          </div>
        ) : (
          /* Show the Control Buttons if complete and not edditing */
          <div className="flex gap-4 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => {/* Logic to check against secret key */}}
              className="px-8 py-3 bg-foreground text-background font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              CONFIRMAR
            </button>
            
            <button 
              onClick={handleEdit}
              className="px-8 py-3 border-2 border-foreground text-foreground font-bold rounded-lg hover:bg-foreground/10 transition-colors"
            >
              EDITAR
            </button>
          </div>
        )}
        {/* The DragOverlay is the "Magic Layer" */}
        <DragOverlay adjustScale={true}>
          {activeId ? (
            <div className="flex h-17 sm:h-20 w-17 sm:w-20 items-center justify-center rounded-lg bg-foreground text-background text-2xl font-bold shadow-2xl opacity-90 cursor-grabbing">
              {activeItem?.val}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}