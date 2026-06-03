export const ROLE_ROUTES: Record<string, string[]> = {
  "/user/settings": ["STUDENT", "AFFILIATE", "CREATOR"],
  "/user/dashboard": ["STUDENT", "AFFILIATE", "CREATOR"],
  "/user/explore": ["STUDENT", "AFFILIATE", "CREATOR"],
  "/user/courses": ["STUDENT"],
  "/user/achievements": ["STUDENT", "AFFILIATE", "CREATOR"],
  "/user/affiliations": ["AFFILIATE"],
  "/user/products": ["CREATOR"],
};
