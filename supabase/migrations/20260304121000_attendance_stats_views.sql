-- Attendance statistics views for per-employee aggregates and period rollups.
-- Provides overall totals plus min/median/max daily counts, and weekly/monthly/annual summaries with period bounds.

BEGIN;

-- Base daily rollup (one row per employee per calendar day)
CREATE OR REPLACE VIEW public.employee_daily_attendance_stats_view AS
SELECT
  al.employee_id,
  date_trunc('day', al.timein_time)::date AS day,
  count(*) FILTER (WHERE al.is_absent) AS absences,
  count(*) FILTER (WHERE al.is_overtime) AS overtimes,
  count(*) FILTER (WHERE COALESCE(al.is_ontime, true) = false AND COALESCE(al.is_absent, false) = false) AS lates,
  count(*) FILTER (WHERE al.over_breaktime) AS over_breaktimes,
  count(*) FILTER (WHERE al.is_undertime) AS undertimes
FROM public."AttendanceLog" al
GROUP BY al.employee_id, date_trunc('day', al.timein_time)::date;

-- Overall stats with min/median/max of daily counts per employee
CREATE OR REPLACE VIEW public.total_attendance_stats_view AS
SELECT
  u.id AS employee_id,
  u.email,
  u.name,
  COALESCE(SUM(d.absences), 0) AS total_absences,
  COALESCE(SUM(d.overtimes), 0) AS total_overtimes,
  COALESCE(SUM(d.lates), 0) AS total_lates,
  COALESCE(SUM(d.over_breaktimes), 0) AS total_over_breaktimes,
  COALESCE(SUM(d.undertimes), 0) AS total_undertimes,
  -- Daily distribution stats
  MIN(d.absences) AS min_absences_per_day,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY d.absences) AS median_absences_per_day,
  MAX(d.absences) AS max_absences_per_day,
  MIN(d.overtimes) AS min_overtimes_per_day,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY d.overtimes) AS median_overtimes_per_day,
  MAX(d.overtimes) AS max_overtimes_per_day,
  MIN(d.lates) AS min_lates_per_day,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY d.lates) AS median_lates_per_day,
  MAX(d.lates) AS max_lates_per_day,
  MIN(d.over_breaktimes) AS min_over_breaktimes_per_day,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY d.over_breaktimes) AS median_over_breaktimes_per_day,
  MAX(d.over_breaktimes) AS max_over_breaktimes_per_day,
  MIN(d.undertimes) AS min_undertimes_per_day,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY d.undertimes) AS median_undertimes_per_day,
  MAX(d.undertimes) AS max_undertimes_per_day
FROM public."User" u
LEFT JOIN public.employee_daily_attendance_stats_view d ON d.employee_id = u.id
GROUP BY u.id, u.email, u.name;

-- Weekly rollup (ISO week anchored by date_trunc('week'))
CREATE OR REPLACE VIEW public.employee_weekly_attendance_stats_view AS
SELECT
  u.id AS employee_id,
  u.email,
  u.name,
  period_start,
  (period_start + interval '1 week' - interval '1 second') AS period_end,
  SUM(d.absences) AS absences,
  SUM(d.overtimes) AS overtimes,
  SUM(d.lates) AS lates,
  SUM(d.over_breaktimes) AS over_breaktimes,
  SUM(d.undertimes) AS undertimes
FROM (
  SELECT
    employee_id,
    date_trunc('week', day)::date AS period_start,
    absences,
    overtimes,
    lates,
    over_breaktimes,
    undertimes
  FROM public.employee_daily_attendance_stats_view
) d
JOIN public."User" u ON u.id = d.employee_id
GROUP BY u.id, u.email, u.name, period_start;

-- Monthly rollup
CREATE OR REPLACE VIEW public.employee_monthly_attendance_stats_view AS
SELECT
  u.id AS employee_id,
  u.email,
  u.name,
  period_start,
  (period_start + interval '1 month' - interval '1 second') AS period_end,
  SUM(d.absences) AS absences,
  SUM(d.overtimes) AS overtimes,
  SUM(d.lates) AS lates,
  SUM(d.over_breaktimes) AS over_breaktimes,
  SUM(d.undertimes) AS undertimes
FROM (
  SELECT
    employee_id,
    date_trunc('month', day)::date AS period_start,
    absences,
    overtimes,
    lates,
    over_breaktimes,
    undertimes
  FROM public.employee_daily_attendance_stats_view
) d
JOIN public."User" u ON u.id = d.employee_id
GROUP BY u.id, u.email, u.name, period_start;

-- Annual rollup
CREATE OR REPLACE VIEW public.employee_annual_attendance_stats_view AS
SELECT
  u.id AS employee_id,
  u.email,
  u.name,
  period_start,
  (period_start + interval '1 year' - interval '1 second') AS period_end,
  SUM(d.absences) AS absences,
  SUM(d.overtimes) AS overtimes,
  SUM(d.lates) AS lates,
  SUM(d.over_breaktimes) AS over_breaktimes,
  SUM(d.undertimes) AS undertimes
FROM (
  SELECT
    employee_id,
    date_trunc('year', day)::date AS period_start,
    absences,
    overtimes,
    lates,
    over_breaktimes,
    undertimes
  FROM public.employee_daily_attendance_stats_view
) d
JOIN public."User" u ON u.id = d.employee_id
GROUP BY u.id, u.email, u.name, period_start;

COMMIT;
