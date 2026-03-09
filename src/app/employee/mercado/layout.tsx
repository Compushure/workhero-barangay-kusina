import { MercadoLayoutClient } from '@/components/employee/mercado/mercado-layout-client';

interface MercadoLayoutProps {
  children: React.ReactNode;
}
export default function MercadoLayout({ children }: MercadoLayoutProps) {
  return <MercadoLayoutClient>{children}</MercadoLayoutClient>;
}
