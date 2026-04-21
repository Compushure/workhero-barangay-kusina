'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RewardIconProps {
  onOpen: () => void;
  disabled?: boolean;
}

export default function RewardIcon({ onOpen, disabled = false }: RewardIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center font-pixel">
          <Button
            type="button"
            disabled={disabled}
            onClick={onOpen}
            aria-label="Open reward request feedbacks"
            className="relative h-18 w-18 rounded-full border-3 border-[#47331F] bg-[#8A6039] shadow-[5px_5px_0px_#000] shadow-[#47331F]/55 transition-transform hover:bg-[#9A6E45] cursor-pointer hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#F4B925]/60 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            <Image
              src="/assets/kitchen-bg/mailbox-icon.png"
              alt="Reward feedback icon"
              width={52}
              height={52}
              className="h-12 w-12 object-contain"
              priority
            />
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="font-pixel bg-[#FFF2CC] text-[#3B2A1A] border-[#47331F]/30"
      >
        reward requests from the mercado
      </TooltipContent>
    </Tooltip>
  );
}
