export type Role = "STUDENT" | "CREATOR" | "AFFILIATE" | "ADMIN";

export interface Gamifications {
  xp: number;
  level: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullname: string | null;
  bio: string | null;
  role: Role;
  avatar: string | null;
  phone: string | null;
  banned?: boolean;
  gamifications: Gamifications;
}

export interface ProfileResponse {
  message: string;
  data: UserProfile;
}

export type AchievementStatus = "unlocked" | "in_progress" | "locked";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  status: AchievementStatus;
  progress: number;
  unlockedAt: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  senderId: string | null;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    username: string | null;
    fullname: string | null;
    role: Role;
  } | null;
}
