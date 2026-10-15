export const UNCERTAIN_SUBMISSION_KEY = 'distrisoft-uncertain-submissions';

export type UncertainSubmission = {
  apiBaseUrl: string;
  idempotencyKey: string;
  payloadHash: string;
};

type PendingMap = Record<string, UncertainSubmission>;

export function readUncertainSubmission(
  apiBaseUrl: string,
): UncertainSubmission | null {
  return readMap()[apiBaseUrl] ?? null;
}

export function rememberUncertainSubmission(
  submission: UncertainSubmission,
): void {
  const map = readMap();
  map[submission.apiBaseUrl] = submission;
  window.localStorage.setItem(UNCERTAIN_SUBMISSION_KEY, JSON.stringify(map));
}

export function forgetUncertainSubmission(apiBaseUrl: string): void {
  const map = readMap();
  delete map[apiBaseUrl];
  window.localStorage.setItem(UNCERTAIN_SUBMISSION_KEY, JSON.stringify(map));
}

export function resetUncertainSubmissions(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(UNCERTAIN_SUBMISSION_KEY);
  }
}

function readMap(): PendingMap {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  const raw = window.localStorage.getItem(UNCERTAIN_SUBMISSION_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as PendingMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}
