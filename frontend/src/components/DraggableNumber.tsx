//DraggableNumber.tsx
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableProps {
    id: string;
    value: string;
}
export default function DraggableNumber({ id, value }: DraggableProps){
    // Initialising the draggable hook
    const {attributes, listeners, setNodeRef, transform} = useDraggable({ id });

    // Apply the moving transformation (the x and y coordinates)
    const style = {transform: CSS.Translate.toString(transform)};

    return(
        <div 
        ref={setNodeRef} 
        style={style} 
        {...listeners}
        {...attributes}
        className="flex h-16 w-16 cursor-grab items-center justify-center rounded-full bg-foreground text-background text-2xl font-black shadow-xl active:cursor-grabbing active:scale-110 transition-none" >{value}</div>
    );
}