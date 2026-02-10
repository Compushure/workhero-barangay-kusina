// app/attendance/components/ChefLoading.tsx
'use client';

export default function ChefLoading() {
  return (
    <div className="flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 64 64"
        className="animate-bounce"
      >
        {/* Chef hat */}
        <path
          d="M20 12c0-6 8-10 12-10s12 4 12 10c0 4-2 6-4 8H24c-2-2-4-4-4-8z"
          fill="#fff"
          stroke="#000"
          strokeWidth="2"
        />
        {/* Face */}
        <circle cx="32" cy="28" r="8" fill="#f9d29d" stroke="#000" strokeWidth="2" />
        {/* Body */}
        <rect x="24" y="36" width="16" height="20" fill="#ccc" stroke="#000" strokeWidth="2" />
        {/* Ladle */}
        <path d="M44 28c6 0 10 6 10 12s-4 12-10 12" fill="none" stroke="#000" strokeWidth="3" />
        <circle cx="44" cy="52" r="4" fill="#666" />
      </svg>
      <span className="ml-2 text-sm font-medium">Cooking up your attendance...</span>
    </div>
  );
}
