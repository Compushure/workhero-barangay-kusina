interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#e8c4b0] via-[#d4a59a] to-[#b8a395] p-8 flex items-center justify-center">
      <div className="bg-[#4a2c2a] border-4 border-[#2d1b1a] rounded-lg p-12 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="text-8xl mb-4">⚠️</div>
          <p
            className="text-red-400 text-3xl font-black mb-2"
            style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}
          >
            ERROR!
          </p>
          <p className="text-amber-200 text-lg font-semibold" style={{ fontFamily: 'monospace' }}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
