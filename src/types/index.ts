/**
 * Type Definitions
 * =================
 * Centralized location for all application types and interfaces.
 * 
 * Types are organized by domain:
 * - shared: Common types used across the application
 * - manager: Manager-specific types
 * - hr: HR-specific types
 * - employee: Employee-specific types
 * - admin: Admin-specific types
 */

// Re-export all domain types for convenience
export * from './shared';
export * from './manager';
export * from './hr';
export * from './employee';
export * from './admin';
