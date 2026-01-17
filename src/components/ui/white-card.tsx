import * as React from 'react';
import { Card } from '@/components/ui/card';

interface WhiteCardProps {
  children: React.ReactNode;
  className?: string;
}

export function WhiteCard({ children, className }: WhiteCardProps) {
  return <Card className={`bg-primary-foreground shadow-lg ${className || ''}`}>{children}</Card>;
}
