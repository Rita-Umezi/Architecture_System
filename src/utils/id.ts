import { v4 as uuidv4 } from 'uuid'

/** Generate a new UUID v4 */
export function generateId(): string {
  return uuidv4()
}

/** Generate a short ID (first 8 chars of UUID, suitable for display) */
export function generateShortId(): string {
  return uuidv4().replace(/-/g, '').slice(0, 8)
}
