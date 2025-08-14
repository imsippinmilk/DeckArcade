import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import useGameSchema from 'src/app/useGameSchema';

const schema = {
  properties: {
    maxPlayers: { type: 'number' },
    allowDouble: { type: 'boolean' },
    deckType: { enum: ['standard', 'short'] },
    sideBets: { type: 'array', items: { enum: ['pairs', '21+3'] } },
  },
};

const TestComponent = () => {
  const { elements } = useGameSchema(schema);
  return <div>{elements}</div>;
};

describe('useGameSchema', () => {
  it('maps schema types to form controls', () => {
    render(<TestComponent />);
    const numberInput = screen.getByLabelText('maxPlayers') as HTMLInputElement;
    expect(numberInput.type).toBe('number');
    const boolInput = screen.getByLabelText('allowDouble') as HTMLInputElement;
    expect(boolInput.type).toBe('checkbox');
    const select = screen.getByLabelText('deckType') as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    const pairs = screen.getByLabelText('pairs') as HTMLInputElement;
    const side21 = screen.getByLabelText('21+3') as HTMLInputElement;
    expect(pairs.type).toBe('checkbox');
    expect(side21.type).toBe('checkbox');
  });
});
