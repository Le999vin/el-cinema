export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: hour,
  label: `${hour.toString().padStart(2, "0")}:00`,
}));

export const focusFirstInvalidField = (form: HTMLFormElement): boolean => {
  if (form.reportValidity()) {
    return true;
  }

  form.querySelector<HTMLElement>(":invalid")?.focus();
  return false;
};
