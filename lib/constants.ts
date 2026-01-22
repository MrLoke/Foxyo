// ------ AUTH ------
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 72;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 30;

// ------ API ------
export const API_HCAPTCHA = "https://api.hcaptcha.com/siteverify";
export const API_DICEBEAR = "https://api.dicebear.com/7.x/initials/svg?seed=";

// ------ APP ------
export const MOBILE_BREAKPOINT = 768;
export const MAX_UPLOAD_AVATAR_SIZE = 5242880; // 5MB

// ------ ROUTES ------
export const HOME_ROUTE = "/";
export const SIGNIN_ROUTE = "/signin";
export const SIGNUP_ROUTE = "/signup";
export const AUTH_CALLBACK_ROUTE = "/auth/callback";
export const AUTH_ERROR_REDIRECT_PATH = "/auth/auth-code-error?error=";
export const VERIFY_EMAIL_ROUTE = "/auth/verify-email";
export const PRIVACY_POLICY_ROUTE = "/privacy-policy";
export const TERMS_OF_SERVICE_ROUTE = "/terms-of-service";
export const RESET_PASSWORD_ROUTE = "/reset-password";
export const USER_ACCOUNT_ROUTE = "/account";
export const DASHBOARD_ROUTE = "/dashboard";
export const MESSAGES_ROUTE = "/messages";
export const ROOMS_LIST_ROUTE = "/rooms";
export const NOTIFICATIONS_ROUTE = "/notifications";
export const SETTINGS_ROUTE = "/settings";

export const PUBLIC_ROUTES = [
  HOME_ROUTE,
  SIGNIN_ROUTE,
  SIGNUP_ROUTE,
  PRIVACY_POLICY_ROUTE,
  TERMS_OF_SERVICE_ROUTE,
  AUTH_CALLBACK_ROUTE,
  VERIFY_EMAIL_ROUTE,
];
