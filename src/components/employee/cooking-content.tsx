'use client';

/**
 * CookingContent - Client Component
 * Central cooking animation and content area
 * Displays the cooking pot and dishes animation
 */
export function CookingContent() {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-linear-to-b from-amber-200 to-orange-300 p-4">
      {/* Cooking Pot Illustration */}
      <div className="mb-4 text-center">
        <div className="mb-2 text-4xl">🍲</div>
        <p className="text-xs font-medium text-orange-900">Cooking Table</p>
      </div>

      {/* Dishes Display */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((dish) => (
          <div key={dish} className="text-2xl">
            🍜
          </div>
        ))}
      </div>

      {/* Placeholder for animation */}
      <p className="mt-3 text-xs text-orange-800">Your cooking progress appears here</p>
    </div>
  );
}
