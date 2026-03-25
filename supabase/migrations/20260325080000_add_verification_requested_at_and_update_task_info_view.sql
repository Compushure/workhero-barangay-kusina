ALTER TABLE public."KPITask"
ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMPTZ;

COMMENT ON COLUMN public."KPITask".verification_requested_at
IS 'Timestamp when employee submits the task for verification (in review). Updated on each resubmission.';

CREATE OR REPLACE VIEW public.task_info_view AS
 SELECT k.id AS kpitask_id,
    k.assigned_by,
    k.assigned_to,
    k.status,
    k.created_at AS kpitask_created_at,
    k.completed_at AS kpitask_completed_at,
    k.pending_orders,
    k.completed_orders,
    k.max_orders,
    k.points_claimed_at,
    u_from.role_id AS assigned_by_role_id,
    u_from.name AS assigned_by_name,
    u_from.employee_id AS assigned_by_employee_id,
    "Role_from".type AS assigned_by_role_name,
    u_to.role_id AS assigned_to_role_id,
    u_to.name AS assigned_to_name,
    u_to.employee_id AS assigned_to_employee_id,
    "Role_to".type AS assigned_to_role_name,
    c.id AS category_id,
    c.name AS category_name,
    c.description AS category_description,
    c.points AS category_points,
    c.xp AS category_xp,
    k.deadline_date AS k_deadline_date,
    k.remark,
    k.verification_requested_at AS kpitask_verification_requested_at
   FROM "KPITask" k
     LEFT JOIN "User" u_from ON u_from.id = k.assigned_by
     LEFT JOIN "Role" "Role_from" ON "Role_from".id = u_from.role_id
     LEFT JOIN "User" u_to ON u_to.id = k.assigned_to
     LEFT JOIN "Role" "Role_to" ON "Role_to".id = u_to.role_id
     LEFT JOIN "KPICategory" c ON c.id = k.category_id;
