/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { isReturnToProlificButton } from './ProlificDeclinedRedirect';

function makeButton(label: string, disabled = false) {
  const button = document.createElement('button');
  button.textContent = label;
  button.disabled = disabled;
  document.body.appendChild(button);
  return button;
}

describe('isReturnToProlificButton', () => {
  it('matches Return to Prolific, including nested label clicks', () => {
    const button = makeButton('');
    const label = document.createElement('span');
    label.textContent = 'Return to Prolific';
    button.appendChild(label);
    expect(isReturnToProlificButton(label)).toBe(button);
  });

  it('ignores other next buttons and disabled Return to Prolific', () => {
    expect(isReturnToProlificButton(makeButton('Submit and return to Prolific'))).toBeNull();
    expect(isReturnToProlificButton(makeButton('Next'))).toBeNull();
    expect(isReturnToProlificButton(makeButton('Return to Prolific', true))).toBeNull();
  });
});
