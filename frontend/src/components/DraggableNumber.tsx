//DraggableNumber.tsx
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableProps {
    id: string;
    value: string;
    onClick?: () => void;
}
export default function DraggableNumber({ id, value, onClick }: DraggableProps){
    // Initialising the draggable hook
    const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({ id });

    // Apply the moving transformation (the x and y coordinates)
    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transform ? "none" : "transform 200ms ease",
        zIndex: transform ? 999 : 1,
        opacity: isDragging ? 0.3 : 1,
        touchAction: "none",
    };

    return(
        <div 
        ref={setNodeRef} 
        style={style} 
        {...listeners}
        {...attributes}
        onClick={onClick}
        className="flex h-16 w-16 cursor-grab items-center justify-center rounded-full bg-foreground text-background text-2xl font-black shadow-xl active:cursor-grabbing active:scale-110 transition-none" >{value}</div>
    );
}