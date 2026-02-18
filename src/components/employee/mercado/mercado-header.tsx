import { ReactNode } from 'react';

interface MercadoHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function MercadoHeader({ title, subtitle, actions }: MercadoHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative">
          {/* Pixel-style title with decorative elements */}
          <div className="flex items-center gap-3">
            <img src="/mercado.png" alt="Mercado" className="w-12 h-12 pixelated" />
            <div>
              <h1 className="text-3xl font-bold text-[#690003] pixelated-text">{title}</h1>
              {subtitle && <p className="text-[#7a3d3d] mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>
        {actions && <div className="flex items-center gap-4">{actions}</div>}
      </div>
    </div>
  );
}
