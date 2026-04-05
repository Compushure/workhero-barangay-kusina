import { MercadoLayoutClient } from '@/components/employee/mercado/mercado-layout-client';

interface MercadoLayoutProps {
  children: React.ReactNode;
}
export default function MercadoLayout({ children }: MercadoLayoutProps) {
  return (
    <div className="relative h-svh min-h-svh w-full overflow-hidden md:h-dvh md:min-h-dvh">
      <MercadoLayoutClient>{children}</MercadoLayoutClient>
    </div>
  );
}
