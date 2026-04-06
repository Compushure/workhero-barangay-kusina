import { randomUUID } from 'node:crypto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type RoleType = 'superadmin' | 'manager' | 'hr' | 'regular';

type SessionUser = {
  id: string;
  email: string;
  roleType: RoleType;
};

type StorageTarget = {
  bucket: string;
  path: string;
};

type SeedUserOptions = {
  roleType: RoleType;
  namePrefix?: string;
  emailPrefix?: string;
  employeeIdPrefix?: string;
  password?: string;
  employmentStatus?: '' | 'probational' | 'regular';
  contactNumber?: string | null;
  address?: string | null;
  tin?: string | null;
  sss?: string | null;
  pagibig?: string | null;
  points?: number;
  xp?: number;
  level?: number;
  totalPointsEarned?: number;
};

type SeedBadgeOptions = {
  createdBy?: string | null;
  namePrefix?: string;
  description?: string | null;
  points?: number;
  awardAtInterval?: 'none' | 'daily' | 'monthly' | 'anually';
  imgLink?: string | null;
  conditions?: Array<{
    requirement_type: 'task' | 'attribute' | 'attendance';
    requirement_operator: '=' | '>' | '<' | '>=' | '<=' | '!=';
    requirement_attrb_id: string | null;
    requirement_attrb_value: number;
    logic_type?: 'and' | 'or';
  }>;
};

type SeedCategoryOptions = {
  namePrefix?: string;
  description?: string | null;
  points?: number;
  xp?: number;
  isRepeatable?: boolean;
  type?: string | null;
};

type SeedTaskOptions = {
  assignedBy: string;
  assignedTo: string;
  categoryId: string;
  status?: 'assigned' | 'in review' | 'approved' | 'rejected';
  pendingOrders?: number;
  completedOrders?: number;
  maxOrders?: number;
  remark?: string | null;
  completedAt?: string | null;
  verificationRequestedAt?: string | null;
  deadlineDate?: string | null;
};

type SeedAttendanceLogOptions = {
  employeeId: string;
  timeIn: string;
  timeOut?: string;
  isOnTime?: boolean;
  isOvertime?: boolean;
  isAbsent?: boolean;
  noTimeout?: boolean;
  isUndertime?: boolean;
  breakStart?: string | null;
  breakEnd?: string | null;
  overBreaktime?: boolean;
};

type SeedNotificationOptions = {
  userId: string;
  type: 'badge' | 'user' | 'task' | 'reward';
  message: string;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
};

type SeedUserBadgeOptions = {
  badgeId: string;
  awardedTo: string;
  awardedBy?: string | null;
  dateAcquired?: string;
};

export type SeededUser = SessionUser & {
  name: string;
  password: string;
  employeeId: string | null;
};

function getRequiredEnv(
  key:
    | 'SUPABASE_URL'
    | 'SUPABASE_SERVICE_ROLE_KEY'
    | 'NEXT_PUBLIC_SUPABASE_URL'
    | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
): string {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required test environment variable: ${key}`);
  }

  return value;
}

function createSupabaseClient(url: string, key: string) {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function withRetries<T>(operation: () => Promise<T>, attempts: number = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const isRetryable = /fetch failed|timeout|network|econnreset/i.test(message);

      if (!isRetryable || attempt === attempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Remote operation failed');
}

export function createServiceRoleClient() {
  return createSupabaseClient(
    getRequiredEnv('SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  );
}

export function createAuthenticatedServerClient(user: SessionUser | null) {
  const client = createServiceRoleClient();
  const auth = {
    ...client.auth,
    getUser: async () => ({
      data: {
        user: user
          ? {
              id: user.id,
              email: user.email,
              app_metadata: { user_role: user.roleType },
            }
          : null,
      },
      error: null,
    }),
    getSession: async () => ({
      data: {
        session: user
          ? {
              user: {
                id: user.id,
                email: user.email,
                app_metadata: { user_role: user.roleType },
              },
            }
          : null,
      },
      error: null,
    }),
    getClaims: async () => ({
      data: {
        claims: user
          ? {
              app_metadata: {
                user_role: user.roleType,
              },
            }
          : null,
      },
      error: null,
    }),
  };

  return new Proxy(client, {
    get(target, property, receiver) {
      if (property === 'auth') {
        return auth;
      }

      const value = Reflect.get(target, property, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }) as SupabaseClient;
}

async function getRoleIdMap(client: SupabaseClient) {
  const { data, error } = await client.from('Role').select('id, type');

  if (error) {
    throw new Error(`Failed to load role ids for integration tests: ${error.message}`);
  }

  return new Map<string, string>(
    (data || []).map((row) => [row.type, row.id] as const)
  );
}

export class RemoteSupabaseTestContext {
  private readonly serviceClient = createServiceRoleClient();
  private readonly fileLabel: string;
  private roleIds: Map<string, string> | null = null;
  private readonly trackedAuthUserIds = new Set<string>();
  private readonly trackedUserIds = new Set<string>();
  private readonly trackedBadgeIds = new Set<string>();
  private readonly trackedCategoryIds = new Set<string>();
  private readonly trackedTaskIds = new Set<string>();
  private readonly trackedAttendanceLogIds = new Set<string>();
  private readonly trackedNotificationIds = new Set<string>();
  private readonly trackedUserBadgeIds = new Set<string>();
  private readonly trackedStorageTargets: StorageTarget[] = [];

  constructor(fileLabel: string) {
    this.fileLabel = fileLabel;
  }

  get admin() {
    return this.serviceClient;
  }

  createServerClientForUser(user: SessionUser | null) {
    return createAuthenticatedServerClient(user);
  }

  trackUserId(userId: string) {
    this.trackedUserIds.add(userId);
    this.trackedAuthUserIds.add(userId);
  }

  trackNotificationId(notificationId: string) {
    this.trackedNotificationIds.add(notificationId);
  }

  trackBadgeId(badgeId: string) {
    this.trackedBadgeIds.add(badgeId);
  }

  trackCategoryId(categoryId: string) {
    this.trackedCategoryIds.add(categoryId);
  }

  trackTaskId(taskId: string) {
    this.trackedTaskIds.add(taskId);
  }

  trackAttendanceLogId(attendanceLogId: string) {
    this.trackedAttendanceLogIds.add(attendanceLogId);
  }

  trackUserBadgeId(userBadgeId: string) {
    this.trackedUserBadgeIds.add(userBadgeId);
  }

  trackStorageObject(bucket: string, path: string) {
    this.trackedStorageTargets.push({ bucket, path });
  }

  private async getRoleIds() {
    if (!this.roleIds) {
      this.roleIds = await getRoleIdMap(this.serviceClient);
    }

    return this.roleIds;
  }

  private buildUniqueSuffix(label: string) {
    const compactUuid = randomUUID().replace(/-/g, '').slice(0, 10);
    return `${this.fileLabel}-${label}-${Date.now()}-${compactUuid}`.toLowerCase();
  }

  async seedUser(options: SeedUserOptions): Promise<SeededUser> {
    const suffix = this.buildUniqueSuffix(options.emailPrefix || options.roleType);
    const email = `${options.emailPrefix || options.roleType}.${suffix}@example.com`;
    const name = `${options.namePrefix || 'Test User'} ${suffix}`;
    const password = options.password || 'TestPass123!';
    const employeeId = `${options.employeeIdPrefix || options.roleType}-id-${suffix}`.slice(0, 64);
    const roleIds = await this.getRoleIds();
    const roleId = roleIds.get(options.roleType);

    if (!roleId) {
      throw new Error(`Missing role id for ${options.roleType}`);
    }

    const { data: authData, error: authError } = await withRetries(async () =>
      this.serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
        app_metadata: { user_role: options.roleType },
      })
    );

    if (authError || !authData.user) {
      throw new Error(`Failed to seed auth user: ${authError?.message || 'Unknown error'}`);
    }

    this.trackedAuthUserIds.add(authData.user.id);

    const insertPayload: Record<string, unknown> = {
      id: authData.user.id,
      role_id: roleId,
      name,
      email,
      date_added: new Date().toISOString(),
      employee_id: employeeId,
      employment_status:
        options.roleType === 'regular' ? options.employmentStatus || 'regular' : null,
      contact_details: options.contactNumber ?? null,
      home_address: options.address ?? null,
      tin_id: options.tin ?? null,
      sss_id: options.sss ?? null,
      pagibig_id: options.pagibig ?? null,
    };

    if (options.roleType === 'regular') {
      insertPayload.points = options.points ?? 0;
      insertPayload.xp = options.xp ?? 0;
      insertPayload.level = options.level ?? 1;
      insertPayload.total_points_earned = options.totalPointsEarned ?? 0;
    }

    const { error: userInsertError } = await this.serviceClient.from('User').insert(insertPayload);

    if (userInsertError) {
      await this.serviceClient.auth.admin.deleteUser(authData.user.id).catch(() => undefined);
      this.trackedAuthUserIds.delete(authData.user.id);
      throw new Error(`Failed to seed public user row: ${userInsertError.message}`);
    }

    this.trackedUserIds.add(authData.user.id);

    return {
      id: authData.user.id,
      email,
      name,
      password,
      employeeId,
      roleType: options.roleType,
    };
  }

  async seedBadge(options: SeedBadgeOptions = {}) {
    const suffix = this.buildUniqueSuffix(options.namePrefix || 'badge');
    const name = `${options.namePrefix || 'Integration Badge'} ${suffix}`.slice(0, 255);
    const { data: badgeRow, error: badgeError } = await this.serviceClient
      .from('Badges')
      .insert({
        name,
        description: options.description ?? 'Seeded badge for integration tests',
        points: options.points ?? 25,
        award_at_interval: options.awardAtInterval ?? 'none',
        img_link: options.imgLink ?? null,
        created_by: options.createdBy ?? null,
      })
      .select('*')
      .single();

    if (badgeError || !badgeRow) {
      throw new Error(`Failed to seed badge: ${badgeError?.message || 'Unknown error'}`);
    }

    this.trackedBadgeIds.add(badgeRow.id);

    if (options.conditions?.length) {
      const { error: requirementsError } = await this.serviceClient
        .from('BadgeRequirements')
        .insert(
          options.conditions.map((condition) => ({
            badge_id: badgeRow.id,
            requirement_type: condition.requirement_type,
            requirement_operator: condition.requirement_operator,
            requirement_interval: 'none',
            requirement_attrb_id: condition.requirement_attrb_id,
            requirement_attrb_value: condition.requirement_attrb_value,
            logic_type: condition.logic_type ?? 'and',
          }))
        );

      if (requirementsError) {
        throw new Error(`Failed to seed badge requirements: ${requirementsError.message}`);
      }
    }

    return badgeRow;
  }

  async seedCategory(options: SeedCategoryOptions = {}) {
    const suffix = this.buildUniqueSuffix(options.namePrefix || 'category');
    const name = `${options.namePrefix || 'Integration Category'} ${suffix}`.slice(0, 255);
    const { data, error } = await this.serviceClient
      .from('KPICategory')
      .insert({
        name,
        description: options.description ?? 'Seeded category for integration tests',
        points: options.points ?? 10,
        xp: options.xp ?? 5,
        is_repeatable: options.isRepeatable ?? true,
        type: options.type ?? 'integration-test',
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to seed KPI category: ${error?.message || 'Unknown error'}`);
    }

    this.trackedCategoryIds.add(data.id);
    return data;
  }

  async seedTask(options: SeedTaskOptions) {
    const { data, error } = await this.serviceClient
      .from('KPITask')
      .insert({
        assigned_by: options.assignedBy,
        assigned_to: options.assignedTo,
        category_id: options.categoryId,
        status: options.status ?? 'in review',
        pending_orders: options.pendingOrders ?? 1,
        completed_orders: options.completedOrders ?? 0,
        max_orders: options.maxOrders ?? 3,
        remark: options.remark ?? null,
        completed_at: options.completedAt ?? null,
        verification_requested_at:
          options.verificationRequestedAt ?? new Date().toISOString(),
        deadline_date: options.deadlineDate ?? null,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to seed KPI task: ${error?.message || 'Unknown error'}`);
    }

    this.trackedTaskIds.add(data.id);
    return data;
  }

  async seedAttendanceLog(options: SeedAttendanceLogOptions) {
    const { data, error } = await this.serviceClient
      .from('AttendanceLog')
      .insert({
        employee_id: options.employeeId,
        timein_time: options.timeIn,
        timeout_time: options.timeOut ?? options.timeIn,
        is_ontime: options.isOnTime ?? true,
        is_overtime: options.isOvertime ?? false,
        is_absent: options.isAbsent ?? false,
        no_timeout: options.noTimeout ?? false,
        is_undertime: options.isUndertime ?? false,
        breaktime_start: options.breakStart ?? null,
        breaktime_end: options.breakEnd ?? null,
        over_breaktime: options.overBreaktime ?? false,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to seed attendance log: ${error?.message || 'Unknown error'}`);
    }

    this.trackedAttendanceLogIds.add(data.id);
    return data;
  }

  async seedNotification(options: SeedNotificationOptions) {
    const { data, error } = await this.serviceClient
      .from('Notification')
      .insert({
        user_id: options.userId,
        type: options.type,
        message: options.message,
        metadata: options.metadata ?? null,
        read_at: options.readAt ?? null,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to seed notification: ${error?.message || 'Unknown error'}`);
    }

    this.trackedNotificationIds.add(data.id);
    return data;
  }

  async seedUserBadge(options: SeedUserBadgeOptions) {
    const { data, error } = await this.serviceClient
      .from('UserBadges')
      .insert({
        badge_id: options.badgeId,
        awarded_to: options.awardedTo,
        awarded_by: options.awardedBy ?? null,
        date_acquired: options.dateAcquired ?? new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to seed user badge: ${error?.message || 'Unknown error'}`);
    }

    this.trackedUserBadgeIds.add(data.id);
    return data;
  }

  async uploadStorageObject(bucket: string, path: string, file?: File) {
    const uploadFile =
      file ||
      new File([Buffer.from('integration-test')], path.split('/').pop() || 'file.txt', {
        type: 'text/plain',
      });

    const { error } = await this.serviceClient.storage.from(bucket).upload(path, uploadFile, {
      cacheControl: '3600',
      upsert: true,
      contentType: uploadFile.type || 'text/plain',
    });

    if (error) {
      throw new Error(`Failed to seed storage object (${bucket}/${path}): ${error.message}`);
    }

    this.trackStorageObject(bucket, path);
  }

  async cleanup() {
    const cleanupErrors: string[] = [];

    const storageTargetsByBucket = this.trackedStorageTargets.reduce<Record<string, string[]>>(
      (accumulator, target) => {
        accumulator[target.bucket] = accumulator[target.bucket] || [];
        accumulator[target.bucket].push(target.path);
        return accumulator;
      },
      {}
    );

    for (const [bucket, paths] of Object.entries(storageTargetsByBucket)) {
      if (!paths.length) {
        continue;
      }

      const { error } = await this.serviceClient.storage.from(bucket).remove(paths);
      if (error) {
        cleanupErrors.push(`Failed to remove storage objects from ${bucket}: ${error.message}`);
      }
    }

    if (this.trackedNotificationIds.size) {
      const { error } = await this.serviceClient
        .from('Notification')
        .delete()
        .in('id', [...this.trackedNotificationIds]);
      if (error) {
        cleanupErrors.push(`Failed to remove notifications: ${error.message}`);
      }
    }

    if (this.trackedUserBadgeIds.size) {
      const { error } = await this.serviceClient
        .from('UserBadges')
        .delete()
        .in('id', [...this.trackedUserBadgeIds]);
      if (error) {
        cleanupErrors.push(`Failed to remove user badges: ${error.message}`);
      }
    }

    if (this.trackedTaskIds.size) {
      const { error } = await this.serviceClient
        .from('KPITask')
        .delete()
        .in('id', [...this.trackedTaskIds]);
      if (error) {
        cleanupErrors.push(`Failed to remove KPI tasks: ${error.message}`);
      }
    }

    if (this.trackedAttendanceLogIds.size) {
      const { error } = await this.serviceClient
        .from('AttendanceLog')
        .delete()
        .in('id', [...this.trackedAttendanceLogIds]);
      if (error) {
        cleanupErrors.push(`Failed to remove attendance logs: ${error.message}`);
      }
    }

    if (this.trackedBadgeIds.size) {
      const { error } = await this.serviceClient
        .from('Badges')
        .delete()
        .in('id', [...this.trackedBadgeIds]);
      if (error) {
        cleanupErrors.push(`Failed to remove badges: ${error.message}`);
      }
    }

    if (this.trackedCategoryIds.size) {
      const { error } = await this.serviceClient
        .from('KPICategory')
        .delete()
        .in('id', [...this.trackedCategoryIds]);
      if (error) {
        cleanupErrors.push(`Failed to remove KPI categories: ${error.message}`);
      }
    }

    if (this.trackedUserIds.size) {
      const { error } = await this.serviceClient
        .from('User')
        .delete()
        .in('id', [...this.trackedUserIds]);
      if (error) {
        cleanupErrors.push(`Failed to remove public users: ${error.message}`);
      }
    }

    for (const authUserId of this.trackedAuthUserIds) {
      const { error } = await this.serviceClient.auth.admin.deleteUser(authUserId);
      if (error && !/user not found/i.test(error.message || '')) {
        cleanupErrors.push(`Failed to remove auth user ${authUserId}: ${error.message}`);
      }
    }

    this.trackedStorageTargets.length = 0;
    this.trackedNotificationIds.clear();
    this.trackedUserBadgeIds.clear();
    this.trackedTaskIds.clear();
    this.trackedAttendanceLogIds.clear();
    this.trackedBadgeIds.clear();
    this.trackedCategoryIds.clear();
    this.trackedUserIds.clear();
    this.trackedAuthUserIds.clear();

    if (cleanupErrors.length) {
      throw new Error(cleanupErrors.join('\n'));
    }
  }
}
