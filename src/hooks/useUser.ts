
import { useState } from 'react';

interface User {
  name: string;
  role: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return { user, login, logout };
};
