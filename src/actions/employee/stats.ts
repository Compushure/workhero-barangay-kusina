/**
 * Employee Statistics Actions
 * NOTE LNG NA BASI MAY KULANAGAN KO DI
 * this was refactored and reedited when this task was reassigned
 * 
 * 
 * This file contains all employee stat getter functions:
 * - getEmployeeLevel: Fetches the current employee's level
 * - getEmployeePoints: Fetches points and deducted points
 * - getEmployeePerformanceScore: Fetches performance_score ((task points × completed tasks) + badge points)
 * - getEmployeeRank: Fetches rank among all employees
 * - getEmployeeXP: Fetches current and total XP
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import { getPeriodStartEnd, toManilaDateString } from '@/lib/utils/time-period-utils';
import type {
  EmployeeRank,
  EmployeeTopRankEntry,
  EmployeeXP,
  RankLogPeriodType,
} from '@/types';

export interface EmployeePointsData {
  points: number;
  deductedPoints: number;
}

// legacy code indi ko pag tandugun basi maguaba ang elsewehre na basi
// ginamit ni. Honsetly I DO NOT THINK this is needed because  it's checking for a gaetway error
// should've just handle this using a supabase helper and zod validations
function isSupabaseGatewayError(message: string | undefined): boolean {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    (normalized.includes('502') || normalized.includes('bad gateway'))
    && (normalized.includes('<!doctype html') || normalized.includes('<html') || normalized.includes('cloudflare'))
  );
}

export async function getEmployeeLevel(): Promise<ActionResult<number>> {
  return safeAction(async () => {
    const supabase = await createClient();

    // only sincewe need date for in-session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // this is actually fetching from a view called user-attributes 
    // the user-attribtues view is a view that joins roles, users, and other deeper level with strong conenction their user
    const { data, error } = await supabase
      .from('user_attributes')
      .select('user_level')
      .eq('user_id', user.id)
      .single();
      // honestly pwede man kuhaon sa users table ni

    if (error) {
      throw new Error(`Failed to fetch user level: ${error.message}`);
    }

    if (!data) {
      throw new Error('User level data not found');
    }

    // defaults to 1 ang nakaset na daan diri- ig for display purposes since ga expect integer ang frontend
    return data.user_level ?? 1;
  });
}

export async function getEmployeePoints(): Promise<ActionResult<EmployeePointsData>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // honestly the way gin strucutre ang point and deducted points is messy
    // legacy code is a little unreliable, but a full on refactor would call for BIG data base changes
    /// knowing this is a REAL TECHNICAL DEBT WE'VE decided to take and not fix considering time feasibility
    // deducted points refers to point that have been deducted to the mercado and is a way for the db to persist lost points and then 
    // give them back if the mercado request is denied
    const { data, error } = await supabaseAdmin
      .from('User')
      .select('points, deducted_points')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user points: ${error.message}`);
    }

    
    if (!data) {
      throw new Error('User points data not found');
    }

    return {
      points: data.points ?? 0,
      deductedPoints: data.deducted_points ?? 0,
    };
  });
}

/**
 * # remedied by josh around mga later na, before this was not working but was a backend eissues instad ofa  fetch issue
 * Fetches the current employee's performance score from user_attributes.
 * performance_score = (total KPI task points × completed tasks) + badge points (used for leaderboard ranking).
 */
export async function getEmployeePerformanceScore(): Promise<ActionResult<number>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_attributes')
      .select('performance_score')
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch performance score: ${error.message}`);
    }

    if (!data) {
      return 0;
    }

    return Number(data.performance_score ?? 0);
  });
}

/**
 * Fetches the latest visible weekly rank snapshot for the current employee.
 * Ranking is generated by HR and stored in RankingPeriod + RankingEntry.
 * Employees should keep seeing the most recent weekly ranking that HR has
 * made visible, even if a newer hidden week already exists.
 * Uses admin client to read period visibility (RLS would otherwise hide non-visible periods).
 */
export async function getEmployeeRank(): Promise<ActionResult<EmployeeRank>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Fetch the latest weekly period that is visible to employees.
    const { data: latestPeriod, error: periodError } = await supabaseAdmin
      .from('RankingPeriod')
      .select('id')
      .eq('period_type', 'weekly')
      .eq('is_visible', true)
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (periodError) {
      throw new Error(`Failed to fetch ranking period: ${periodError.message}`);
    }

    // No weekly ranking exists yet, or latest week is hidden — show "Not available yet"
    if (!latestPeriod) {
      return {
        rank: 1,
        performanceScore: 0,
        totalEmployees: 1,
      };
    }

    //  Fetch all entries for this period 
    const { data: allEntries, error: allEntriesError } = await supabaseAdmin
      .from('RankingEntry')
      .select('user_id, rank, performance_score')
      .eq('ranking_period_id', latestPeriod.id);

    if (allEntriesError) {
      throw new Error(`Failed to fetch ranking entries: ${allEntriesError.message}`);
    }

    if (!allEntries || allEntries.length === 0) {
      return {
        rank: 1,
        performanceScore: 0,
        totalEmployees: 1,
      };
    }

    // Step 3: Find the current user's entry
    const userEntry = allEntries.find((entry) => entry.user_id === user.id);

    return {
      rank: userEntry?.rank ?? allEntries.length + 1,
      performanceScore: Number(userEntry?.performance_score ?? 0),
      totalEmployees: allEntries.length,
    };
  });
}

/**
 * Fetches the top 10 weekly rankings for the latest week that HR generated.
 * Uses the same "latest weekly period" as HR (RankingPeriod), then returns
 * entries only when that period is visible to employees.
 * Returns null when no visible weekly ranking exists for the latest period.
 */
export async function getEmployeeTopWeeklyRanks(): Promise<
  ActionResult<EmployeeTopRankEntry[] | null>
> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Use same source as HR: latest weekly period from RankingPeriod (the week HR generated)
    const { data: latestPeriod, error: periodError } = await supabaseAdmin
      .from('RankingPeriod')
      .select('period_start')
      .eq('period_type', 'weekly')
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (periodError) {
      if (isSupabaseGatewayError(periodError.message)) {
        console.warn('Supabase returned a transient 502 while fetching the latest weekly ranking period.');
        return null;
      }

      throw new Error(`Failed to fetch latest ranking period: ${periodError.message}`);
    }

    if (!latestPeriod?.period_start) {
      return null;
    }

    const periodStart = latestPeriod.period_start;

    // Fetch top 10 for that period only when it is visible to employees
    const { data: rows, error: rowsError } = await supabaseAdmin
      .from('ranking_leaderboard_view')
      .select('user_id, user_name, rank, performance_score')
      .eq('period_type', 'weekly')
      .eq('is_visible', true)
      .eq('period_start', periodStart)
      .order('rank', { ascending: true })
      .limit(10);

    if (rowsError) {
      throw new Error(`Failed to fetch ranking entries: ${rowsError.message}`);
    }

    if (!rows || rows.length === 0) {
      return null;
    }

    const result: EmployeeTopRankEntry[] = rows.map((row) => {
      const { data: urlData } = supabaseAdmin.storage
        .from('employees')
        .getPublicUrl(`${row.user_id}/profile.png`);
      return {
        rank: row.rank,
        userId: row.user_id ?? '',
        name: row.user_name ?? '',
        performanceScore: Number(row.performance_score ?? 0),
        isCurrentUser: row.user_id === user.id,
        profilePictureUrl: urlData?.publicUrl ?? null,
      };
    });

    return result;
  });
}

/**
 * Fetches the top 10 rankings for a specific period (weekly, monthly, or yearly).
 * Only returns data when that period exists and is visible to employees.
 */
export async function getEmployeeTopRanksByPeriod(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): Promise<ActionResult<EmployeeTopRankEntry[] | null>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { start } = getPeriodStartEnd(
      periodType,
      year,
      periodType === 'monthly' ? month : undefined,
      periodType === 'weekly' ? week : undefined
    );
    const periodStart = toManilaDateString(start);

    const { data: rows, error: rowsError } = await supabaseAdmin
      .from('ranking_leaderboard_view')
      .select('user_id, user_name, rank, performance_score')
      .eq('period_type', periodType)
      .eq('is_visible', true)
      .eq('period_start', periodStart)
      .order('rank', { ascending: true })
      .limit(10);

    if (rowsError) {
      throw new Error(`Failed to fetch ranking entries: ${rowsError.message}`);
    }

    if (!rows || rows.length === 0) {
      return null;
    }

    const result: EmployeeTopRankEntry[] = rows.map((row) => {
      const { data: urlData } = supabaseAdmin.storage
        .from('employees')
        .getPublicUrl(`${row.user_id}/profile.png`);
      return {
        rank: row.rank,
        userId: row.user_id ?? '',
        name: row.user_name ?? '',
        performanceScore: Number(row.performance_score ?? 0),
        isCurrentUser: row.user_id === user.id,
        profilePictureUrl: urlData?.publicUrl ?? null,
      };
    });

    return result;
  });
}

/**
 * Get level data from the Level table
 * @param levelNumber The level to fetch (1-10)
 * @returns Level data with xp requirement and other details
 * 
 * ANTON- AKO ni actually do nag refactor gid, medyo ga struggle gid ako
 *  note: some legacy code is retaied JUST BECAUS I DO NOT KNOW IF THEY DO SOMETHING ELSE
 * note again: damo2 ni ga conflict sa triggers related to the leves
 *  note: gin refactor ko na ang triggers will be dissbale and migrate all functionality to the front end
 *  NOTE NOTE NOTE: i may have missed some functionality as i was not assigned to this fucntion before, and idk ang behavior pa gid na gin implemtn
 * 
 */
async function getLevelData(levelNumber: number): Promise<{
  xp: number;
  level: number;
  description?: string;
  bg_img_link?: string;
} | null> {
  const supabase = await createClient();

  // the bg img is actually tied to the level, amo to ang kitchen cosmetic chuhu2


  const { data, error } = await supabase
    .from('Level')
    .select('level, xp, description, bg_img_link')
    .eq('level', levelNumber)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    level: data.level,
    xp: data.xp ?? 100, // Default fallback to 100 XP if not set
    description: data.description,
    bg_img_link: data.bg_img_link,
  };
}

/** 
 * Calculate total XP based on Level table data
 * @param level User's current level (capped at 10)
 * ANother legacy issues was the original dev assigned to this made multiple copiesand columns of 
 * xp, current xp and total xp, which the values did not synchronize, due to this had to do hard reset with sql sa db
 * NOTE: may have unsavory or hard to see bugs, indi na madiagnose kay basi DB Level na ang guba
 * @param currentXP User's current XP within the level (0-99)
 * @returns Total cumulative XP (Level threshold + currentXP within level)
 */
async function calculateTotalXP(level: number, currentXP: number): Promise<number> {
  const cappedLevel = Math.min(Math.max(level, 1), 10);

  const getRequiredXpForLevel = async (targetLevel: number): Promise<number> => {
    // Level 1 progression uses level 2 requirement since level 1 entry is usually 0.
    const requirementLevel = targetLevel <= 1 ? 2 : targetLevel;
    const levelData = await getLevelData(requirementLevel);
    const fallback = requirementLevel * 100;
    // the fallback does note affect anything just a placeholder kung wla or well edge case in general

    return Math.max(1, levelData?.xp ?? fallback);
  };

  let total = 0;
  for (let lvl = 1; lvl < cappedLevel; lvl += 1) {
    total += await getRequiredXpForLevel(lvl);
  }

  return total + Math.max(0, currentXP);
}

export async function getEmployeeXP(): Promise<ActionResult<EmployeeXP>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabaseAdmin
      .from('User')
      .select('xp, level, total_xp')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user XP: ${error.message}`);
    }

    if (!data) {
      throw new Error('User XP data not found');
    }

    // Default level to 1 if null or 0, cap at 10
    let level = data.level && data.level > 0 ? data.level : 1;
    level = Math.min(level, 10); // Enforce level cap

    const currentXP = data.xp ?? 0;
    const storedTotalXP = data.total_xp;
    const totalXP =
      typeof storedTotalXP === 'number' && Number.isFinite(storedTotalXP)
        ? Math.max(0, storedTotalXP)
        : await calculateTotalXP(level, currentXP);

    return {
      currentXP,
      totalXP,
      level,
    };
  });
}

/**
 * Get XP required to reach the next level
 * @param currentLevel Current user level (1-10)
 * @returns XP required to reach nextLevel (or 100 as default fallback)
 */
export async function getXPRequiredForNextLevel(currentLevel: number): Promise<ActionResult<number>> {
  // actually naka hungod cap sa level 10, mostly because of client conflict
  // the client does not have a set plan for the levelling function yet
  // that being said the developers are also pretty lost regarding diri. 
  // with the agreed date coming due, we are force to do "DUMMY DEMO NUMBERS"
  return safeAction(async () => {
    const cappedLevel = Math.min(currentLevel, 10);

    // If already at max level, return 0
    if (cappedLevel >= 10) {
      return 0;
    }

    // Per-level threshold from DB. For level 1, use level 2 threshold since level 1 is usually 0.
    const thresholdLevel = cappedLevel <= 1 ? 2 : cappedLevel;
    const levelData = await getLevelData(thresholdLevel);
    const fallback = thresholdLevel * 100;

    return Math.max(0, levelData?.xp ?? fallback);
  });
}

/**
 * Get all level metadata (for caching/initialization)
 * @returns Array of all level data with XP requirements
 */
export interface LevelMetadata {
  level: number;
  xp: number;
  description?: string;
  bg_img_link?: string;
}

export interface XPDebugUpdateResult {
  level: number;
  xp: number;
  totalXP: number;
}

export async function getAllLevelMetadata(): Promise<ActionResult<LevelMetadata[]>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('Level')
      .select('level, xp, description, bg_img_link')
      .order('level', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch level metadata: ${error.message}`);
    }

    if (!data || data.length === 0) {
      // this is actually a fallback in case the level table is empty, which should not happen since it's seeded,
      //  but just in case, we return default levels with hardcoded XP requirements and descriptions
      //  THIS SPECIFIC ROWS ARE  are what's persisted and inserted in the migration file you can reference
      // 20260321_add_level_xp_and_dish_appearance.sql
      // basic gist parehos ni sila sang insert statement until level 10 ONLY
      // Return default levels if table is empty
      return [
        { level: 1, xp: 0, description: 'Level 1 - Trainee' },
        { level: 2, xp: 100, description: 'Level 2 - Apprentice' },
        { level: 3, xp: 250, description: 'Level 3 - Skilled' },
        { level: 4, xp: 450, description: 'Level 4 - Experienced' },
        { level: 5, xp: 700, description: 'Level 5 - Expert' },
        { level: 6, xp: 1000, description: 'Level 6 - Master' },
        { level: 7, xp: 1350, description: 'Level 7 - Grand Master' },
        { level: 8, xp: 1750, description: 'Level 8 - Legendary' },
        { level: 9, xp: 2200, description: 'Level 9 - Mythic' },
        { level: 10, xp: 2700, description: 'Level 10 - Ultimate Chef' },
      ];
    }

    return data.map((row) => ({
      level: row.level,
      xp: row.xp ?? 100,
      description: row.description,
      bg_img_link: row.bg_img_link,
    }));
  });
}

function deriveLevelAndCurrentXPFromTotalXP(totalXP: number, levelRows: LevelMetadata[]): {
  level: number;
  xp: number;
} {
  // note the that truc is only there to force INTEGER RETURNS
  const safeTotalXP = Math.max(0, Math.trunc(totalXP));

  const thresholds = new Map<number, number>();
  for (const row of levelRows) {
    thresholds.set(row.level, row.xp ?? 100);
  }
// gets the requirement level for 2 if it's less than equal to 1
// in the legacy data ang deafult was actually 0 idk ngaa amo na pag implement
// safe to say i tried to make sure that the default will not be 1 for safety measures indi na lng
// ma explicit === to 1 otherwise might have unsavory or unexpected behavior
  const getRequiredXpForLevel = (level: number): number => {
    const requirementLevel = level <= 1 ? 2 : level;
    return Math.max(1, thresholds.get(requirementLevel) ?? requirementLevel * 100);
  };

  let remaining = safeTotalXP;
  let level = 1;

  // Consume per-level requirements until max level is reached.
  while (level < 10) {
    const required = getRequiredXpForLevel(level);
    if (remaining < required) {
      break;
    }
// basically lopped to check if the total xp is enough to level up, 
// if it is then we consume the xp and move on to the next level until we reach the max level or we run out of xp to consume
    remaining -= required;
    level += 1;
  }

  return { level, xp: remaining };
}

/**
 * HELLO DEBUG LNG NI NI ANTON TI KAY ANO BI need ko i tset if gagana and natamad na ko sagi balik db
 * NOTE TO FUTURE DEVS: 😃😃😃😃WALA NI GA AFFECT SANG FUNCTIONALITY AND WILL ONLY SHOW ON THE TEST AND LOCAL BUILDS
 * HIDDEN ANG COMPONENT DURING PROD BUILDS SO YOU DONT" HAVE TO WORRYA BOTU REMOVING THE DEBUG
 * Debug-only action to increase/decrease XP of the authenticated active employee.
 * Disabled in production.
 */
export async function adjustActiveUserXPByDelta(
  delta: number
): Promise<ActionResult<XPDebugUpdateResult>> {
  return safeAction(async () => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('XP debug action is disabled in production');
    }

    const normalizedDelta = Math.trunc(delta);
    if (!Number.isFinite(normalizedDelta) || normalizedDelta === 0) {
      throw new Error('Delta must be a non-zero number');
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: currentData, error: currentError } = await supabaseAdmin
      .from('User')
      .select('xp, level, total_xp')
      .eq('id', user.id)
      .single();

    if (currentError || !currentData) {
      throw new Error(`Failed to fetch current XP data: ${currentError?.message ?? 'No data found'}`);
    }

    const currentLevel = Math.min(Math.max(currentData.level ?? 1, 1), 10);
    const currentXP = Math.max(0, currentData.xp ?? 0);
    const currentTotalXP =
      typeof currentData.total_xp === 'number' && Number.isFinite(currentData.total_xp)
        ? Math.max(0, currentData.total_xp)
        : await calculateTotalXP(currentLevel, currentXP);
    const nextTotalXP = Math.max(0, currentTotalXP + normalizedDelta);

    const { data: levelRows, error: levelError } = await supabase
      .from('Level')
      .select('level, xp, description, bg_img_link')
      .order('level', { ascending: true });

    if (levelError) {
      throw new Error(`Failed to fetch level metadata: ${levelError.message}`);
    }

    const normalizedRows: LevelMetadata[] =
      levelRows && levelRows.length > 0
        ? levelRows.map((row) => ({
            level: row.level,
            xp: row.xp ?? 100,
            description: row.description,
            bg_img_link: row.bg_img_link,
          }))
        : [
            { level: 1, xp: 0 },
            { level: 2, xp: 100 },
            { level: 3, xp: 250 },
            { level: 4, xp: 450 },
            { level: 5, xp: 700 },
            { level: 6, xp: 1000 },
            { level: 7, xp: 1350 },
            { level: 8, xp: 1750 },
            { level: 9, xp: 2200 },
            { level: 10, xp: 2700 },
          ];

    const derived = deriveLevelAndCurrentXPFromTotalXP(nextTotalXP, normalizedRows);

    const { error: updateError } = await supabaseAdmin
      .from('User')
      .update({
        xp: derived.xp,
        level: derived.level,
        total_xp: nextTotalXP,
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update XP data: ${updateError.message}`);
    }

    return {
      level: derived.level,
      xp: derived.xp,
      totalXP: nextTotalXP,
    };
  });
}
