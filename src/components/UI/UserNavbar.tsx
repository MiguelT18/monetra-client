import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import MenuButton from "@/components/UI/MenuButton";
import { useProfile } from "@/hooks/useProfile";

interface UserNavbarProps {
  isOpen: boolean;
  onToggle: (value: boolean) => void;
}

function ProfileInfo({
  username,
  level,
  xp,
}: {
  username: string;
  level: number;
  xp: number;
}) {
  return (
    <div>
      <p className="text-white text-sm">Hola, {username}</p>
      <p className="text-white/50 text-xs">
        Nivel {level} — {xp} XP
      </p>
    </div>
  );
}

export function UserNavbar({ isOpen, onToggle }: UserNavbarProps) {
  const { user, loading } = useProfile();

  return (
    // SkeletonTheme define los colores base para todos los Skeleton hijos
    <SkeletonTheme baseColor="#ffffff10" highlightColor="#ffffff20">
      <nav className="col-span-3 bg-[#101826]/30 mb-2 rounded-lg p-4">
        {/* Desktop navbar */}
        <div className="max-md:hidden flex items-center justify-between">
          <MenuButton isOpen={isOpen} onToggle={onToggle} />

          {loading || !user ? (
            <div className="flex flex-col gap-1 animate-pulse">
              <div className="h-3.5 w-24 bg-white/10 rounded" />
              <div className="h-3 w-32 bg-white/5 rounded" />
            </div>
          ) : (
            <ProfileInfo
              username={user.username}
              level={user.gamifications.level}
              xp={user.gamifications.xp}
            />
          )}
        </div>

        {/* Mobile navbar */}
        <div className="md:hidden">
          <div className="flex items-center justify-end w-full">
            <MenuButton isOpen={isOpen} onToggle={onToggle} />
          </div>
        </div>
      </nav>
    </SkeletonTheme>
  );
}
