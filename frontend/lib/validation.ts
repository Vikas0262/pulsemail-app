const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  if (!EMAIL_RE.test(trimmed)) return "Enter a valid email address";
  return null;
}

export function validatePassword(password: string, minLength = 6): string | null {
  if (!password) return "Password is required";
  if (password.length < minLength) return `Password must be at least ${minLength} characters`;
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required`;
  return null;
}

export function validateContactInput(email: string, phone: string): string | null {
  const hasEmail = email.trim().length > 0;
  const hasPhone = phone.trim().length > 0;

  if (!hasEmail && !hasPhone) {
    return "Email or phone is required";
  }

  if (hasEmail && !EMAIL_RE.test(email.trim())) {
    return "Enter a valid email address";
  }

  return null;
}

export function validateFutureDate(isoLocal: string): string | null {
  if (!isoLocal) return "Pick a date and time to schedule";
  const scheduled = new Date(isoLocal);
  if (Number.isNaN(scheduled.getTime())) return "Invalid date/time";
  if (scheduled.getTime() <= Date.now()) return "Scheduled time must be in the future";
  return null;
}
