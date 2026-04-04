jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn(),
}));

import * as Calendar from 'expo-calendar';
import { requestCalendarPermission } from '../request-permission';

const mockRequestPermissions = Calendar.requestCalendarPermissionsAsync as jest.Mock;

describe('requestCalendarPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when permission is granted', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });

    const result = await requestCalendarPermission();
    expect(result).toBe(true);
  });

  it('returns false when permission is denied', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });

    const result = await requestCalendarPermission();
    expect(result).toBe(false);
  });

  it('returns false when permission is undetermined', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'undetermined' });

    const result = await requestCalendarPermission();
    expect(result).toBe(false);
  });

  it('returns false when an error is thrown', async () => {
    mockRequestPermissions.mockRejectedValue(new Error('System error'));

    const result = await requestCalendarPermission();
    expect(result).toBe(false);
  });
});
