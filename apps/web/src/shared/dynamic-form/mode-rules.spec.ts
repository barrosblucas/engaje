import { describe, expect, it } from 'vitest';
import { getRegistrationSubmitRules } from './mode-rules';

describe('mode-rules', () => {
  it('hides submit button in informative mode', () => {
    const rules = getRegistrationSubmitRules('informative', 0);

    expect(rules.requiresDynamicForm).toBe(false);
    expect(rules.showSubmitButton).toBe(false);
    expect(rules.submitDisabled).toBe(true);
  });

  it('disables submit in registration mode when no dynamic fields', () => {
    const rules = getRegistrationSubmitRules('registration', 0);

    expect(rules.requiresDynamicForm).toBe(true);
    expect(rules.showSubmitButton).toBe(true);
    expect(rules.submitDisabled).toBe(true);
  });

  it('enables submit in registration mode with dynamic fields', () => {
    const rules = getRegistrationSubmitRules('registration', 2);

    expect(rules.requiresDynamicForm).toBe(true);
    expect(rules.showSubmitButton).toBe(true);
    expect(rules.submitDisabled).toBe(false);
  });
});
