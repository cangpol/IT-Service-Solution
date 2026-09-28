'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/lib/types';

interface RoleContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  updateUserSession: (updatedFields: Partial<User>) => void;
  refreshCurrentUser: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync user data from server to keep name, email, role, etc. in sync
  const refreshCurrentUser = useCallback(async () => {
    try {
      const stored = localStorage.getItem('upitra_session_user');
      if (stored) {
        const parsed: User = JSON.parse(stored);
        if (parsed && parsed.id) {
          const res = await fetch(`/api/users/${parsed.id}`);
          const data = await res.json();
          if (data.success && data.data) {
            setCurrentUser(data.data);
            localStorage.setItem('upitra_session_user', JSON.stringify(data.data));
          }
        }
      }
    } catch (e) {
      console.error('Failed to refresh user session:', e);
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      try {
        const stored = localStorage.getItem('upitra_session_user');
        if (stored) {
          const parsed: User = JSON.parse(stored);
          if (parsed && parsed.email) {
            setCurrentUser(parsed);
            // Background sync with database
            if (parsed.id) {
              try {
                const res = await fetch(`/api/users/${parsed.id}`);
                const data = await res.json();
                if (data.success && data.data) {
                  setCurrentUser(data.data);
                  localStorage.setItem('upitra_session_user', JSON.stringify(data.data));
                }
              } catch (err) {
                console.error(err);
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse stored session user:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Listen to tab storage changes or window focus
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'upitra_session_user' && e.newValue) {
        try {
          setCurrentUser(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('upitra_session_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const updateUserSession = (updatedFields: Partial<User>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updatedFields };
      try {
        localStorage.setItem('upitra_session_user', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('upitra_session_user');
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/login';
  };

  const handleSetRole = (role: UserRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      try {
        localStorage.setItem('upitra_session_user', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        isLoading,
        login,
        logout,
        setRole: handleSetRole,
        updateUserSession,
        refreshCurrentUser,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
