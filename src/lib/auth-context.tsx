/**
 * Authentication Context Provider
 * =================================
 * Provides authentication state and methods throughout the app.
 * Uses action handlers for auth operations with Supabase integration placeholders.
 *
 * TODO: Uncomment Supabase logic when integration is ready
 */

'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  handleLoginSubmit,
  // handleLogout as handleLogoutAction,
} from '@/action-handlers/auth';
// TODO: Import Supabase client when ready
// import { createClient } from "@/lib/supabase/client"

interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Add useEffect to check initial auth state with Supabase
  // ===============================================================
  // useEffect(() => {
  //   const supabase = createClient()
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     if (session?.user) {
  //       setUser({ id: session.user.id, email: session.user.email! })
  //       setIsAuthenticated(true)
  //     }
  //     setIsLoading(false)
  //   })
  //
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     if (session?.user) {
  //       setUser({ id: session.user.id, email: session.user.email! })
  //       setIsAuthenticated(true)
  //     } else {
  //       setUser(null)
  //       setIsAuthenticated(false)
  //     }
  //   })
  //   return () => subscription.unsubscribe()
  // }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Create FormData to pass to action handler
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const { error } = await handleLoginSubmit(formData);

    if (error) {
      setIsLoading(false);
      return false;
    }

    // Set local state on success
    setUser({ id: '1', email, name: 'Super Admin' });
    setIsAuthenticated(true);
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    // await handleLogoutAction()
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
