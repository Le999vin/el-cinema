const safeAuthMessages = new Set([
  "Invalid credentials.",
  "Email already in use.",
  "Database is required for login.",
  "Database is required for registration.",
]);

export const getSafeAuthErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error && safeAuthMessages.has(error.message)) {
    return error.message;
  }

  console.error(fallbackMessage, error);
  return fallbackMessage;
};
