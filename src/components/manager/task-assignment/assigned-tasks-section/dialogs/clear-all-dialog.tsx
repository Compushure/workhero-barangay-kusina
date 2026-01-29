import { Button } from "@/components/ui/button";
import { useClearAllTasksMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';

interface ClearAllDialogProps {
  setShowClearConfirm: (show: boolean) => void
}

function ClearAllDialog({ setShowClearConfirm } : ClearAllDialogProps) {
  const clearAllMutation = useClearAllTasksMutation();

  const handleClearAll = async () => {
    clearAllMutation.mutate(undefined, {
      onSuccess: () => {
        setShowClearConfirm(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm shadow-lg">
        <h3 className="text-lg font-bold text-[#690003] mb-4">Clear All Assignments?</h3>
        <p className="text-gray-600 mb-6">
          This will unassign all tasks from all employees. This action cannot be undone.
        </p>
        <div className="flex gap-4 justify-end">
          <Button
            onClick={handleClearAll}
            disabled={clearAllMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-all duration-500 ease-in-out"
          >
            {clearAllMutation.isPending ? 'Clearing...' : 'Clear All'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(false)}
            disabled={clearAllMutation.isPending}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClearAll}
            disabled={clearAllMutation.isPending}
            className="bg-[#690003] hover:bg-[#8B0000] text-white"
          >
            {clearAllMutation.isPending ? 'Clearing...' : 'Clear All'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ClearAllDialog;