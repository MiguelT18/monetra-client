export const ROLE_ROUTES: Record<string, string[]> = {
  "/user/settings": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/dashboard": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/explore": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/courses": ["STUDENT"],
  "/user/achievements": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/affiliations": ["AFFILIATE"],
  "/user/products": ["CREATOR"],
};
