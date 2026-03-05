const STORAGE_KEY_PREFIX = "__dco:drawer-open";

function resolveScopeId(appId?: string): string | null {
  const configuredAppId = appId?.trim();
  if (configuredAppId) return configuredAppId;
  if (typeof window === "undefined") return null;

  const hostname = window.location?.hostname?.trim();
  return hostname || null;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getDrawerOpenStorageKey(appId?: string): string | null {
  const scopeId = resolveScopeId(appId);
  if (!scopeId) return null;
  return `${STORAGE_KEY_PREFIX}:${encodeURIComponent(scopeId)}`;
}

export function readDrawerOpenState(appId?: string): boolean | null {
  const storage = getStorage();
  const storageKey = getDrawerOpenStorageKey(appId);
  if (!storage || !storageKey) return null;

  try {
    const value = storage.getItem(storageKey);
    if (value === "1") return true;
    if (value === "0") return false;
    return null;
  } catch {
    return null;
  }
}

export function writeDrawerOpenState(appId: string | undefined, open: boolean): void {
  const storage = getStorage();
  const storageKey = getDrawerOpenStorageKey(appId);
  if (!storage || !storageKey) return;

  try {
    storage.setItem(storageKey, open ? "1" : "0");
  } catch {
    // ignore storage write failures (private mode, disabled storage)
  }
}
