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
  avatar: string | null;
  gamifications: Gamifications;
}

export interface ProfileResponse {
  message: string;
  data: UserProfile;
}
