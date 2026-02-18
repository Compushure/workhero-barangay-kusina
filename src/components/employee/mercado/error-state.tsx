interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-[#fff8f5] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <p className="text-red-600 text-lg font-semibold">⚠️ Oops!</p>
            <p className="text-red-600">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
