import Link from 'next/link';
import { House } from 'lucide-react';

interface AuthHomeLinkProps {
  className?: string;
  iconClassName?: string;
  label?: string;
}

export function AuthHomeLink({
  className = '',
  iconClassName = '',
  label = 'Back to Home',
}: AuthHomeLinkProps) {
  return (
    <Link
      href="/"
      className={className}
      aria-label={label}
    >
      <House className={iconClassName} />
      <span>{label}</span>
    </Link>
  );
}

