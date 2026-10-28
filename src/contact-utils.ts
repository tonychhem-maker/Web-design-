/**
 * Contact Form & Data Utilities (Pure Logic)
 */

export interface ContactFormData {
  name: string;
  email: string;
  topic: string;
  message: string;
  consent: boolean;
  honeypot?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    name?: string;
    email?: string;
    message?: string;
    consent?: string;
    honeypot?: string;
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function validateContactForm(data: ContactFormData): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  if (data.honeypot && data.honeypot.trim().length > 0) {
    errors.honeypot = 'Automated transmission detected.';
    return { valid: false, errors };
  }

  const trimmedName = (data.name || '').trim();
  if (!trimmedName) {
    errors.name = 'Operator name is required.';
  } else if (trimmedName.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  const trimmedEmail = (data.email || '').trim();
  if (!trimmedEmail) {
    errors.email = 'Work email is required.';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Please provide a valid work email address.';
  }

  const trimmedMsg = (data.message || '').trim();
  if (!trimmedMsg) {
    errors.message = 'Transmission payload message is required.';
  } else if (trimmedMsg.length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  } else if (trimmedMsg.length > 1200) {
    errors.message = 'Message exceeds maximum length of 1200 characters.';
  }

  if (!data.consent) {
    errors.consent = 'Consent to privacy policy is required.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function formatCharCounter(current: number, max: number = 1200): string {
  const clamped = Math.max(0, Math.min(current, max));
  const currentStr = String(clamped).padStart(4, '0');
  const maxStr = String(max);
  return `${currentStr} / ${maxStr}`;
}

export function generateAckNumber(prefix = 'BK', seed?: number): string {
  const num = seed !== undefined ? seed : Math.floor(1000 + Math.random() * 9000);
  return `#${prefix}-${num}`;
}

export function buildMailtoFallback(companyEmail: string, data: ContactFormData): string {
  const subject = encodeURIComponent(`[Transmission] ${data.topic || 'Inquiry'} — ${data.name || 'Anonymous'}`);
  const body = encodeURIComponent(
    `Operator: ${data.name}\nEmail: ${data.email}\nTopic: ${data.topic}\n\nMessage:\n${data.message}\n`
  );
  return `mailto:${companyEmail}?subject=${subject}&body=${body}`;
}

export function calculateLatencyJitter(base = 12, range = 3, rand = Math.random()): number {
  return Math.round(base + (rand - 0.5) * range * 2);
}
