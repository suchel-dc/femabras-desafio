//ChallengeSlot.tsx
"use client";
import { useDroppable } from "@dnd-kit/core";

interface SlotProps {
    indexOrder: number;
    orderValue: string;
    onPlace: (indexOrder: number, orderValue: string) => void;
    onKeyDown: (key: React.KeyboardEvent) => void;
    inputRef: (element: HTMLInputElement | null) => void;
}

export default function ChallengeSlot({indexOrder, orderValue, onPlace, onKeyDown, inputRef}: SlotProps){
    // Creates a unique id for the slot
    const { isOver, setNodeRef } = useDroppable({
        id: `slot-${indexOrder}`,
    });
    
    // The behavior when a number is hovering over the box
    const style = {
        borderColor: isOver ? 'var(--foreground)' : 'gray',
        backgroundColor: isOver ? 'rgba(var(--foreground-rgb), 0.1)' : 'transparent',
    };
    return(
     <div
        ref={setNodeRef}
        style={style} 
        className="relative flex h-24 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-transparent">
            <input
            ref={ inputRef }
            type="text"
            maxLength={1}
            value={ orderValue }
            onKeyDown={ onKeyDown }
            onFocus={(keyboard) => keyboard.target.select()}
            onClick={(event) => event.stopPropagation()} 
            onChange={(event) => onPlace(indexOrder, event.target.value)}
            className="h-full w-full bg-transparent text-center text-4xl font-bold uppercase outline-none"
            placeholder="?"
            />
      <div className="absolute inset-0 pointer-events-none" />
    </div>
    );
}
