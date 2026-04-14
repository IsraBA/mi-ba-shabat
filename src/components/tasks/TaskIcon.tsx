"use client";

import {
  FaCartShopping, FaRecycle, FaBroom, FaTrash, FaSoap,
  FaFire, FaSnowflake, FaMugHot, FaBreadSlice, FaCakeCandles,
  FaBowlFood, FaCarrot, FaKitchenSet, FaBowlRice, FaBoxOpen,
  FaMugSaucer, FaCheese, FaHouse, FaBed, FaUser,
} from "react-icons/fa6";
import {
  MdTableRestaurant, MdWaterDrop, MdCleaningServices, MdDining,
  MdLocalLaundryService, MdCountertops,
} from "react-icons/md";

// Map of icon name strings to actual react-icon components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // fa6 icons (mapped from seed data names to actual exports)
  FaShoppingCart: FaCartShopping,
  FaCartShopping,
  FaRecycle,
  FaHome: FaHouse,
  FaBroom,
  FaTrash,
  FaSoap,
  FaFire,
  FaSnowflake,
  FaMugHot,
  FaBreadSlice,
  FaCakeCandles,
  FaBowlFood,
  FaCarrot,
  FaKitchenSet,
  FaBowlRice,
  FaBoxOpen,
  FaMugSaucer,
  FaCheese,
  FaHouse,
  FaBed,
  FaUser,
  // Material design icons
  MdTableRestaurant,
  MdWaterDrop,
  MdCleaningServices,
  MdDining,
  MdLocalLaundryService,
  MdCountertops,
};

interface TaskIconProps {
  name: string;
  className?: string;
}

// Renders a react-icon component by its string name
export function TaskIcon({ name, className }: TaskIconProps) {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}

// Aliases that map old seed names to new fa6 names (not shown in picker)
const ALIASES = new Set(["FaShoppingCart", "FaHome"]);

// Export unique icon names for the picker (excluding aliases)
export const AVAILABLE_ICONS = Object.keys(ICON_MAP).filter(
  (k) => !ALIASES.has(k)
);
