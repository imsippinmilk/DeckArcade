import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HostPanel from 'src/app/HostPanel';
import { sessionStore } from 'src/store/tableSession';

const schema = {
  properties: {
    maxPlayers: { type: 'number' },
  },
};

beforeEach(() => {
  sessionStore.tables.length = 0;
  localStorage.clear();
});

describe('HostPanel integration', () => {
  it('creates tables with chosen config and leaves existing tables unchanged', () => {
    render(<HostPanel gameName="blackjack" gameSettingsSchema={schema} />);
    const numberInput = screen.getByLabelText('maxPlayers') as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '6' } });
    const button = screen.getByText('Start table');
    fireEvent.click(button);
    expect(sessionStore.tables).toHaveLength(1);
    expect((sessionStore.tables[0].config as any).maxPlayers).toBe(6);

    fireEvent.change(numberInput, { target: { value: '4' } });
    fireEvent.click(button);
    expect(sessionStore.tables).toHaveLength(2);
    expect((sessionStore.tables[0].config as any).maxPlayers).toBe(6);
    expect((sessionStore.tables[1].config as any).maxPlayers).toBe(4);
  });
});
