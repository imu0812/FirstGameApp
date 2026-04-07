// Test mode is available in local development builds, or in
// explicitly flagged deployed builds.
// Enable it with `?testMode=1` in the URL, or set
// `localStorage['phaser-survivor:test-mode'] = 'enabled'`.
export const TEST_MODE_EVENTS = {
  command: 'test-mode:command',
  feedback: 'test-mode:feedback'
};

function isTestModeBuildAllowed() {
  if (import.meta.env.DEV) {
    return true;
  }

  return import.meta.env.VITE_ENABLE_TEST_MODE === 'true';
}

export function isTestModeEnabled() {
  if (!isTestModeBuildAllowed()) {
    return false;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const queryValue = searchParams.get('testMode');
  if (queryValue === '1' || queryValue === 'true') {
    return true;
  }

  try {
    return window.localStorage.getItem('phaser-survivor:test-mode') === 'enabled';
  } catch {
    return false;
  }
}
