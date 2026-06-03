import type { IconType } from "react-icons";
import {
  FiPlayCircle, FiZap, FiAward, FiMessageCircle, FiCheckCircle,
  FiBookOpen, FiPackage, FiShoppingBag, FiStar, FiUsers,
  FiDollarSign, FiLayers, FiLink, FiTrendingUp, FiTarget,
  FiShare2,
} from "react-icons/fi";

const iconMap: Record<string, IconType> = {
  FiPlayCircle,
  FiZap,
  FiAward,
  FiMessageCircle,
  FiCheckCircle,
  FiBookOpen,
  FiPackage,
  FiShoppingBag,
  FiStar,
  FiUsers,
  FiDollarSign,
  FiLayers,
  FiLink,
  FiTrendingUp,
  FiTarget,
  FiShare2,
};

export function achievementIcon(name: string): IconType {
  return iconMap[name] ?? FiAward;
}
