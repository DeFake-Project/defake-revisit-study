import { describe, expect, it } from 'vitest';
import { getSignInErrorMessage } from './signInErrors';

describe('getSignInErrorMessage', () => {
  it('explains unauthorized preview domains', () => {
    expect(getSignInErrorMessage({ code: 'auth/unauthorized-domain' })).toContain('Authorized domains');
  });

  it('explains a popup that closed early', () => {
    expect(getSignInErrorMessage({ code: 'auth/popup-closed-by-user' })).toContain('closed before completing');
    expect(getSignInErrorMessage({ code: 'auth/cancelled-popup-request' })).toContain('closed before completing');
  });

  it('falls back to the provider message', () => {
    expect(getSignInErrorMessage({ message: 'Custom failure' })).toBe('Custom failure');
  });
});
