/**
 * Phone number normalization and utility functions.
 * Enforces E.164 format for international SMS delivery (Twilio Verify API v2).
 */

import { ValidationError } from './errors';

/**
 * Normalizes phone numbers to standard international E.164 format (+[country code][number]).
 * Defaults to +91 (India) for 10-digit numbers or numbers missing a country code.
 *
 * Examples:
 *  - "9876543210"        -> "+919876543210"
 *  - "+91 98765 43210"   -> "+919876543210"
 *  - "09876543210"       -> "+919876543210"
 *  - "919876543210"      -> "+919876543210"
 *  - "+1 415 555 2671"   -> "+14155552671"
 *  - "+44 7911 123456"   -> "+447911123456"
 */
export function normalizeToE164(phone: string, defaultCountryCode: string = '+91'): string {
  if (!phone || typeof phone !== 'string') {
    throw new ValidationError('Mobile phone number is required');
  }

  const trimmed = phone.trim();
  const hasPlusPrefix = trimmed.startsWith('+');

  // Strip all non-digit characters
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (!digitsOnly) {
    throw new ValidationError('Invalid phone number: no digits found');
  }

  let formatted = '';

  if (hasPlusPrefix) {
    // Preserves international country code provided by user
    formatted = `+${digitsOnly}`;
  } else if (digitsOnly.length === 10) {
    // Standard 10-digit mobile number (e.g. India)
    const prefix = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    formatted = `${prefix}${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    // 11 digits starting with trunk prefix '0' (e.g. 09876543210)
    const prefix = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    formatted = `${prefix}${digitsOnly.slice(1)}`;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    // 12 digits starting with '91' without '+'
    formatted = `+${digitsOnly}`;
  } else if (digitsOnly.length >= 11 && digitsOnly.length <= 15) {
    // User passed international digits without '+' sign
    formatted = `+${digitsOnly}`;
  } else {
    // Fallback: prepend default country code if valid length
    const prefix = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    formatted = `${prefix}${digitsOnly}`;
  }

  // Validate standard E.164 regex: + followed by 8 to 15 digits, first digit cannot be 0
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  if (!e164Regex.test(formatted)) {
    throw new ValidationError(
      `Invalid phone number format: "${phone}". Please provide a valid mobile number with country code (e.g., +919876543210).`
    );
  }

  return formatted;
}

/**
 * Validates whether a phone number is or can be normalized to valid E.164.
 */
export function isValidPhoneNumber(phone: string): boolean {
  try {
    normalizeToE164(phone);
    return true;
  } catch {
    return false;
  }
}

/**
 * Masks a phone number for UI display and privacy.
 * Example: "+919876543210" -> "+91 ******3210"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  try {
    const e164 = normalizeToE164(phone);
    if (e164.length <= 6) return e164;
    const countryPrefix = e164.slice(0, 3); // e.g. +91
    const last4 = e164.slice(-4);
    const middleLength = e164.length - 3 - 4;
    const maskedMiddle = '*'.repeat(Math.max(middleLength, 4));
    return `${countryPrefix} ${maskedMiddle}${last4}`;
  } catch {
    // Fallback simple masking
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `******${digits.slice(-4)}`;
    }
    return phone;
  }
}
