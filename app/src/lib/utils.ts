import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const mbToBytes = (mb: number) => mb * 1024 * 1024
export const bytesToMB = (bytes: number) => bytes / (1024 * 1024)
export const bytesToGB = (bytes: number) => bytes / (1024 * 1024 * 1024)
export const bytesToTB = (bytes: number) => bytes / (1024 * 1024 * 1024 * 1024)

export const bytesToFormatter = (bytes: number) => {
  if (bytesToMB(bytes) > 1000) {
    return `${bytesToGB(bytes).toFixed(2)} GB`
  } else if (bytesToGB(bytes) > 1000) {
    return `${bytesToTB(bytes).toFixed(2)} TB`
  } else {
    return `${bytesToMB(bytes).toFixed(2)} MB`
  }
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
