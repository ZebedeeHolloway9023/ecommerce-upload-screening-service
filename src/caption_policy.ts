const blockedTerms = ['gun', 'counterfeit', 'stolen']

export type CaptionReview = {
  approved: boolean
  reasons: string[]
}

export function reviewCaption(caption: string): CaptionReview {
  const normalized = caption.toLowerCase()
  const reasons = blockedTerms.filter((term) => normalized.includes(term)).map((term) => `caption_contains:${term}`)

  return {
    approved: reasons.length === 0,
    reasons
  }
}
