"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";

interface AppContextType {
  sessionHistory: SessionHistoryType[];
  setSessionHistory: React.Dispatch<React.SetStateAction<SessionHistoryType[]>>;
  fetchSessionHistory: (userId?: string) => Promise<void>;
  userId?: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export type SessionHistoryType = {
  session_id: string;
  timestamp: string;
};
interface AppProviderProps {
  children: ReactNode;
  userId?: string;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  userId,
}) => {
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryType[]>(
    []
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchSessionHistory = async (userId?: string) => {
    if (userId) {
      const res = await fetch(
        "https://rk4fbjcyc0.execute-api.us-east-1.amazonaws.com/default/chat_history",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      const response = await res.json();
      if (res.status === 200) {
        const sessionData = response.sessions as SessionHistoryType[];
        const sortedSessionData = sessionData.sort((a, b) => {
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
        setSessionHistory(sortedSessionData);
      }
    } else {
      setSessionHistory([]);
    }
  };
  useEffect(() => {
    fetchSessionHistory(userId);
  }, [userId]);

  const value: AppContextType = {
    sessionHistory,
    setSessionHistory,
    fetchSessionHistory,
    userId,
    isSidebarOpen,
    toggleSidebar,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
