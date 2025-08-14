import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Host } from 'src/app/Host';

describe('Host', () => {
  it('opens and closes the lobby modal', () => {
    render(<Host />);
    fireEvent.click(screen.getByText('Create Lobby'));
    expect(screen.queryByLabelText('Lobby Name')).not.toBeNull();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByLabelText('Lobby Name')).toBeNull();
  });
});
