export type Role = "STUDENT" | "CREATOR" | "AFFILIATE";

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
  gamifications: Gamifications;
}

export interface ProfileResponse {
  message: string;
  data: UserProfile;
}
