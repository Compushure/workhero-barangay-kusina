'use client';

interface DutyLabelProps {
  status: any;
}

export default function DutyLabel({ status }: DutyLabelProps) {
  let dutyLabel: { text: string; classes: string } | null = null;

  if (status?.hasTimedOut) {
    dutyLabel = {
      text: '🕓 Clocked Out',
      classes: 'bg-red-200 text-red-700 border-red-400',
    };
  } else if (status?.isOnBreak) {
    dutyLabel = {
      text: '🍩 On Break',
      classes: 'bg-[#E7D09A] text-orange-800 border-[#F4B925]',
    };
  } else if (status?.hasTimedIn) {
    dutyLabel = {
      text: '✅ On Duty',
      classes: 'text-[#29A329] border-[#29A329]',
    };
  } else {
    dutyLabel = {
      text: '⏳ Not Timed In',
      classes: 'bg-[#4D4033] text-[#AD9985] border-[#634D36]',
    };
  }

  return (
    <div className="flex justify-center">
      {dutyLabel && (
        <span
          className={`text-xl px-4 py-2 rounded-full inline-block font-jersey border ${dutyLabel.classes}`}
        >
          {dutyLabel.text}
        </span>
      )}
    </div>
  );
}
