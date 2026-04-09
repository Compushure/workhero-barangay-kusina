/// <reference types="node" />
import dotenv from "dotenv";
import { defineConfig } from "cypress";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

type RoleType = "superadmin" | "manager" | "hr" | "regular" | "employee";

type AddUserPayload = {
  name: string;
  email: string;
  password: string;
  roleType?: RoleType;
  employeeId?: string | null;
  employmentStatus?: string | null;
  contactDetails?: string | null;
  homeAddress?: string | null;
  tinId?: string | null;
  sssId?: string | null;
  pagibigId?: string | null;
};

function getRequiredEnv(key: string): string {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required Cypress env var: ${key}`);
  }

  return value;
}

function getProjectRefFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split(".")[0] || "";
  } catch {
    return "";
  }
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function createServiceRoleClient() {
  return createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

function createPublicClient() {
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();

  if (!publishableKey) {
    throw new Error(
      "Missing required Cypress env var: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: "http://localhost:3008",
    setupNodeEvents(on, config) {
      // implement node event listeners here

      on("task", {
        // define the tasks here so that they can be used in the commands.ts
        // use direct Supabase client logic (do not import server actions)
        async login({ email, password }: { email: string; password: string }) {
          console.log("[task:login] Starting login for", email);

          const supabase = createPublicClient();
          const normalizedEmail = normalizeEmail(email);
          const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (error || !data.session) {
            console.log("[task:login] Failed:", error?.message ?? "No session");
            throw error ?? new Error("Failed to sign in user");
          }

          console.log("[task:login] Success; returning session");
          return data.session;
        },

        async addUser(payload: AddUserPayload) {
          console.log("[task:addUser] Creating user", payload.email);

          const supabase = createServiceRoleClient();
          const normalizedEmail = normalizeEmail(payload.email);
          const roleType = (payload.roleType ?? "superadmin").trim().toLowerCase();

          const { data: existingUser } = await supabase
            .from("User")
            .select("id, email")
            .eq("email", normalizedEmail)
            .maybeSingle();

          if (existingUser?.id) {
            console.log("[task:addUser] User already exists in User table");
            await supabase.auth.admin
              .updateUserById(existingUser.id, {
                password: payload.password,
                user_metadata: { name: payload.name ?? null },
                app_metadata: { user_role: roleType },
              })
              .catch(() => undefined);
            return { userId: existingUser.id, email: normalizedEmail, existed: true };
          }

          let roleId: string | null = null;
          const roleQuery = await supabase
            .from("Role")
            .select("id")
            .eq("type", roleType)
            .limit(1)
            .maybeSingle();

          if (roleQuery.data?.id) {
            roleId = roleQuery.data.id;
          } else if (roleQuery.error) {
            throw new Error(
              `Failed to lookup role (${roleType}): ${roleQuery.error?.message || "not found"}`
            );
          }

          if (!roleId) {
            console.log("[task:addUser] Role not found; creating role", roleType);
            const { data: roleInsert, error: roleInsertError } = await supabase
              .from("Role")
              .insert([{ type: roleType }])
              .select("id")
              .single();

            if (roleInsertError || !roleInsert?.id) {
              throw new Error(
                `Failed to create role (${roleType}): ${roleInsertError?.message || "unknown"}`
              );
            }

            roleId = roleInsert.id;
          }

          const { data: createData, error: createError } = await supabase.auth.admin.createUser({
            email: normalizedEmail,
            password: payload.password,
            email_confirm: true,
            user_metadata: { name: payload.name ?? null },
            app_metadata: { user_role: roleType },
          });

          if (createError || !createData?.user) {
            throw new Error(createError?.message || "Failed to create auth user");
          }

          const newUser = createData.user;

          const normalizedEmploymentStatus = payload.employmentStatus?.trim().toLowerCase();

          const insertPayload = {
            id: newUser.id,
            email: normalizedEmail,
            name: payload.name ?? newUser.email ?? null,
            date_added: new Date().toISOString(),
            employee_id: payload.employeeId || null,
            contact_details: payload.contactDetails || null,
            home_address: payload.homeAddress || null,
            tin_id: payload.tinId || null,
            sss_id: payload.sssId || null,
            pagibig_id: payload.pagibigId || null,
            employment_status: normalizedEmploymentStatus || null,
            role_id: roleId,
          };

          const { error: insertError } = await supabase.from("User").insert([insertPayload]);

          if (insertError) {
            await supabase.auth.admin.deleteUser(newUser.id).catch(() => undefined);
            throw new Error(`Failed to insert user row: ${insertError.message}`);
          }

          console.log("[task:addUser] Created user", newUser.id);
          return { userId: newUser.id, email: normalizedEmail, existed: false };
        },

        async deleteUser({ email }: { email: string }) {
          console.log("[task:deleteUser] Deleting user", email);

          const supabase = createServiceRoleClient();
          const normalizedEmail = normalizeEmail(email);

          const { data: userRow, error: userRowError } = await supabase
            .from("User")
            .select("id")
            .eq("email", normalizedEmail)
            .maybeSingle();

          if (userRowError) {
            throw new Error(`Failed to lookup user row: ${userRowError.message}`);
          }

          let userId = userRow?.id ?? null;

          if (!userId) {
            const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers({
              page: 1,
              perPage: 1000,
            });

            if (listError) {
              throw new Error(`Failed to list auth users: ${listError.message}`);
            }

            const matchedUser = authUsers?.users?.find(
              (user) => user.email?.toLowerCase() === normalizedEmail
            );
            userId = matchedUser?.id ?? null;
          }

          if (!userId) {
            console.log("[task:deleteUser] User not found; nothing to delete");
            return { deleted: false };
          }

          if (userRow?.id) {
            const { error: rowDeleteError } = await supabase
              .from("User")
              .delete()
              .eq("id", userRow.id);

            if (rowDeleteError) {
              throw new Error(`Failed to delete user row: ${rowDeleteError.message}`);
            }
          }

          const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

          if (authDeleteError && !/user not found/i.test(authDeleteError.message ?? "")) {
            throw new Error(`Failed to delete auth user: ${authDeleteError.message}`);
          }

          console.log("[task:deleteUser] Deleted user", userId);
          return { deleted: true };
        },
      });

    },
  },
});
