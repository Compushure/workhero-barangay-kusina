'use client';

import { Coins } from 'lucide-react';
import { useGetEmployeePoints } from '@/hooks/tanstack';

export default function PointsIcon() {
  const { data } = useGetEmployeePoints();
  // const [pointsData, setPointsData] = useState<EmployeePointsData | null>(null);

  // useEffect(() => {
  //   async function fetchPoints() {
  //     const data = await handleFetchEmployeePoints();
  //     setPointsData(data);
  //   }
  //   fetchPoints();
  // }, []);

  return (
    <div className="flex items-center">
      {/* Coin icon overlapping the pill, smaller */}
      <div className="relative z-10 -mr-6">
        <Coins className="w-14 h-14 text-yellow-500 shrink-0" />
      </div>

      {/* Number pill, slightly smaller */}
      <div className="bg-white text-red-800 font-bold px-6 py-2 rounded-full text-xl shadow-md relative z-0 border border-yellow-300">
        {data ? data.points : '...'}
      </div>
    </div>
  );
}
