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
  lastSeenAt?: string | null;
  publishedProducts?: number;
  rejectedProducts?: number;
  gamifications: Gamifications;
  _count?: {
    products: number;
  };
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
  link?: string | null;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string | null;
    username: string | null;
    fullname: string | null;
    role: Role;
  } | null;
}
