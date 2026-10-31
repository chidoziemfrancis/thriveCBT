import { describe, expect, it } from '@jest/globals';

import { containsRiskLanguage } from '@/features/chat/riskLanguage';

describe('containsRiskLanguage', () => {
  it('flags risk phrases regardless of case, punctuation or apostrophes', () => {
    expect(containsRiskLanguage('I want to KILL MYSELF.')).toBe(true);
    expect(
      containsRiskLanguage('honestly i think everyone would be better off dead without me')
    ).toBe(true);
    expect(containsRiskLanguage('I’ve been self-harming... I cut myself last night')).toBe(true);
    expect(containsRiskLanguage('thinking about suicide')).toBe(true);
  });

  it('does not flag ordinary messages', () => {
    expect(containsRiskLanguage('Can we move our check-in to Friday?')).toBe(false);
    expect(containsRiskLanguage('This week’s session was killer, loved it')).toBe(false);
    expect(containsRiskLanguage('I nearly died laughing at the quiz')).toBe(false);
  });
});
