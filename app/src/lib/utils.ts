import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const mbToBytes = (mb: number) => mb * 1024 * 1024


export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))