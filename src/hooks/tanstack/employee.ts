/**
 * Employee Task Hooks
 * ===================
 * Centralized exports for all employee task related TanStack hooks.
 */

// Queries
export { useGetEmployeeTasks, employeeTasksKeys } from './queries/employeeTasksQueries';

// Mutations
export {
  useSubmitTaskVerification,
  useClaimTaskPointsandXP,
} from './mutations/employeeTasksMutations';
