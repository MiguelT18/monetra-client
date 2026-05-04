import { MdOutlineDashboard } from "react-icons/md";

export function UserAside() {
  return (
    <aside className="max-md:hidden bg-[#101826]/30 rounded-lg p-4">
      <ul className="space-y-4">
        <li className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 cursor-pointer">
          <MdOutlineDashboard size={20} />
          <span>Dashboard</span>
        </li>
      </ul>
    </aside>
  );
}
