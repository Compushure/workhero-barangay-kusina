drop trigger if exists "trg_auth_user_delete_on_auth_users" on "auth"."users";

CREATE TRIGGER trg_auth_user_delete_on_auth_users AFTER DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.delete_public_user_on_auth_delete();


