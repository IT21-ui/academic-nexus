import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const format24HourTo12HourTime = (hour: string) => {
  if (!hour || typeof hour !== "string") return "";
  
  const [hours, minutes] = hour.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return "";
  
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}${period}`;
};
