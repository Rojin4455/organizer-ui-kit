/** Must match App2 (`atg-trust` authLogout) query name. */
export const CROSS_APP_LOGOUT_PARAM = 'cross_app_logout';

export function isCrossAppLogoutSearch(search: string): boolean {
  const v = new URLSearchParams(search).get(CROSS_APP_LOGOUT_PARAM);
  return v === '1' || v === 'true' || v === '';
}
