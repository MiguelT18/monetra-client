import { FiBell } from "react-icons/fi";

export function NotificationButton() {
  const hasNotifications = true;

  return (
    <button className="relative p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#7C3AED]/50 dark:hover:border-[#7C3AED]/50 transition-all cursor-pointer group">
      <FiBell
        size={16}
        className="text-gray-500 dark:text-white/50 group-hover:text-[#7C3AED] transition-colors"
      />
      {hasNotifications && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
      )}
    </button>
  );
}
