import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function that combines Tailwind CSS classes with clsx and tailwind-merge
 * 
 * This function takes multiple class values and:
 * 1. Combines them using clsx for conditional class application
 * 2. Merges Tailwind CSS classes intelligently using tailwind-merge
 * 
 * @param {...ClassValue[]} inputs - Class values to combine (strings, objects, or arrays)
 * @returns {string} The merged class string
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500')
 * // => 'px-4 py-2 bg-blue-500'
 * 
 * // With conditions
 * cn('px-4', { 'bg-blue-500': isPrimary, 'bg-gray-500': !isPrimary })
 * 
 * // With Tailwind conflicts resolution
 * cn('px-2 py-1 p-4') // p-4 wins
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
