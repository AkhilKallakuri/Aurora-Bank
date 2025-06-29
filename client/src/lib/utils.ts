import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export const BASE_URL = import.meta.env.VITE_API_URL;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
