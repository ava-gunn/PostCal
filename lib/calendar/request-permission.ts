import * as Calendar from 'expo-calendar';

/**
 * Request calendar write permission from the user.
 * Returns true if granted, false otherwise. Never throws.
 */
export async function requestCalendarPermission(): Promise<boolean> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}
