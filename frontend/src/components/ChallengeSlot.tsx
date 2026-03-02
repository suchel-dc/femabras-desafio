"use client";
interface SlotProps {
    indexOrder: number;
    orderValue: string;
    onPlace: (indexOrder: number, orderValue: string) => void;
}
export default function ChallengeSlot({indexOrder, orderValue, onPlace}: SlotProps){
    return(
        <div className="relative flex h-24 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-transparent transition-all hover:border-foreground">
      <input
        type="text"
        maxLength={1}
        value={orderValue} 
        onChange={(event) => onPlace(indexOrder, event.target.value)}
        className="h-full w-full bg-transparent text-center text-4xl font-bold uppercase outline-none"
        placeholder="?"
      />
      <div className="absolute inset-0 pointer-events-none" />
    </div>
    );
}
