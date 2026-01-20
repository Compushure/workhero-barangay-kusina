'use client';

export function SignupFormFooter({ onToggle }: { onToggle: () => void }) {
  return (
    <div className="mt-8 pt-6 border-t border-border/30 text-center">
      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <button
          onClick={onToggle}
          className="text-primary font-semibold hover:underline transition-colors cursor-pointer"
        >
          Sign in here
        </button>
      </p>
    </div>
  );
}
