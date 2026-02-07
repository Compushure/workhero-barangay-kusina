'use client';

interface HoverBubbleProps {
  show: boolean;
  message: string;
}

export default function HoverBubble({ show, message }: HoverBubbleProps) {
  return (
    <div
      className={`absolute -top-10 left-18 bg-white shadow-lg rounded-full px-6 py-2 
        text-sm font-medium text-gray-700
        transition-all duration-300 ease-in-out transform
        ${show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
      `}
      style={{ minWidth: '150px', maxWidth: '200px' }} // keeps it oval, not too wide
    >
      {message}
      {/* Tail pointing right */}
      <div className="absolute -bottom-1 left-6 w-3 h-3 bg-white rotate-45"></div>
    </div>
  );
}
