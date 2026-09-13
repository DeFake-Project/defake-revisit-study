export function getSignInErrorMessage(error: { code?: string; message?: string } | null | undefined) {
  if (!error) {
    return 'Sign-in failed.';
  }

  if (error.code === 'auth/unauthorized-domain') {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
    return `Google sign-in is not allowed on ${hostname}. Add this hostname in Firebase Authentication → Settings → Authorized domains.`;
  }

  if (error.code === 'auth/popup-blocked') {
    return 'The Google sign-in popup was blocked by the browser. Please allow popups and try again.';
  }

  if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
    return 'The Google sign-in popup closed before completing. Please try again.';
  }

  return error.message || 'Sign-in failed.';
}
