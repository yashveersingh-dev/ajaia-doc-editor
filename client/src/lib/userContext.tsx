import React, { createContext, useContext, useState } from 'react';

// The two mock users are fixed — no auth needed
export const MOCK_USERS = [
  { id: 'user-1', name: 'Alice Chen', email: 'alice@example.com' },
  { id: 'user-2', name: 'Bob Park', email: 'bob@example.com' },
] as const;

export type MockUser = (typeof MOCK_USERS)[number];

const STORAGE_KEY = 'docflow_user_id';

function getInitialUserId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? 'user-1';
}

interface UserContextValue {
  userId: string;
  user: MockUser;
  switchUser: (id: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>(getInitialUserId);

  const user =
    MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0];

  function switchUser(id: string) {
    localStorage.setItem(STORAGE_KEY, id);
    setUserId(id);
  }

  return (
    <UserContext.Provider value={{ userId, user, switchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
