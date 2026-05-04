"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
} from "react-icons/fi";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  function notify(type: NotificationType, message: string) {
    const id = Date.now();

    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }

  function remove(id: number) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const styles = {
    success: "bg-emerald-500 text-white dark:bg-emerald-600",
    error: "bg-red-500 text-white dark:bg-red-600",
    warning: "bg-amber-500 text-white dark:bg-amber-600",
    info: "bg-blue-500 text-white dark:bg-blue-600",
  };

  const icons = {
    success: <FiCheckCircle size={20} />,
    error: <FiXCircle size={20} />,
    warning: <FiAlertTriangle size={20} />,
    info: <FiInfo size={20} />,
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-xs flex-col gap-3 px-3 sm:px-0">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              role="alert"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${styles[n.type]}`}
            >
              <div className="shrink-0">{icons[n.type]}</div>

              <p className="flex-1 text-sm font-medium leading-tight">
                {n.message}
              </p>

              <button
                onClick={() => remove(n.id)}
                className="opacity-80 hover:opacity-100 transition cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }

  return context;
}
