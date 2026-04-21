UPDATE public."KPITask"
SET deadline_date = (
  (((deadline_date AT TIME ZONE 'Asia/Manila')::date::text || ' 23:59:59.999')::timestamp AT TIME ZONE 'Asia/Manila')
)
WHERE deadline_date IS NOT NULL;

CREATE OR REPLACE FUNCTION public.kpitask_normalize_deadline_to_manila_eod()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.deadline_date IS NOT NULL THEN
    NEW.deadline_date :=
      (((NEW.deadline_date AT TIME ZONE 'Asia/Manila')::date::text || ' 23:59:59.999')::timestamp AT TIME ZONE 'Asia/Manila');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_kpitask_normalize_deadline_to_manila_eod ON public."KPITask";

CREATE TRIGGER trg_kpitask_normalize_deadline_to_manila_eod
BEFORE INSERT OR UPDATE OF deadline_date ON public."KPITask"
FOR EACH ROW
EXECUTE FUNCTION public.kpitask_normalize_deadline_to_manila_eod();
