import { JsonValue } from '../../../parser/types';

export const AGREEMENT_SCALE = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
] as const;

export type AgreementAnswer = {
  rating: number | null;
  comment: string;
};

export const EMPTY_AGREEMENT: AgreementAnswer = {
  rating: null,
  comment: '',
};

export function parseAgreement(value: JsonValue | null | undefined): AgreementAnswer {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return EMPTY_AGREEMENT;
  }

  const rating = typeof value.rating === 'number' && Number.isInteger(value.rating)
    ? value.rating
    : null;
  const comment = typeof value.comment === 'string' ? value.comment : '';
  const known = AGREEMENT_SCALE.some((option) => option.value === rating);

  return {
    rating: known ? rating : null,
    comment,
  };
}

/** A comment is required for strongly disagree, disagree, and neither. */
export function commentRequired(rating: number | null): boolean {
  return rating != null && rating < 4;
}

export function commentHint(rating: number | null): string {
  if (rating == null) {
    return 'Comment (required if you choose 1, 2, or 3)';
  }
  if (commentRequired(rating)) {
    return 'What would you change, and why?';
  }
  return 'Comment (optional)';
}

export function validateAgreement(value: JsonValue | null | undefined): string | null {
  const parsed = parseAgreement(value);
  if (parsed.rating == null) {
    return 'Please choose a rating.';
  }
  if (commentRequired(parsed.rating) && parsed.comment.trim().length === 0) {
    return 'Please tell us what you would change and why.';
  }
  return null;
}

export function agreementLabel(rating: number | null): string {
  const match = AGREEMENT_SCALE.find((option) => option.value === rating);
  return match ? `${match.value} · ${match.label}` : 'Not answered';
}
