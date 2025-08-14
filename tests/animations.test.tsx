import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { handleDomainEvent } from 'src/gameAPI/animations';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({ matches }) as any,
  });
}

describe('animation presets', () => {
  afterEach(() => {
    mockMatchMedia(false);
    cleanup();
  });

  it('suppresses animations when reduced motion is preferred', () => {
    mockMatchMedia(true);
    render(<div data-testid="target" />);
    const el = screen.getByTestId('target');
    handleDomainEvent({ type: 'deal' }, el);
    expect(el.classList.contains('anim-deal')).toBe(false);
  });

  it('fires hooks for domain events', () => {
    mockMatchMedia(false);
    render(<div data-testid="target" />);
    const el = screen.getByTestId('target');
    handleDomainEvent({ type: 'deal' }, el);
    expect(el.classList.contains('anim-deal')).toBe(true);
    handleDomainEvent({ type: 'bet' }, el);
    expect(el.classList.contains('anim-bet')).toBe(true);
    handleDomainEvent({ type: 'win' }, el);
    expect(el.classList.contains('anim-win')).toBe(true);
    handleDomainEvent({ type: 'reveal' }, el);
    expect(el.classList.contains('anim-reveal')).toBe(true);
    handleDomainEvent({ type: 'invalid' }, el);
    expect(el.classList.contains('anim-invalid')).toBe(true);
  });
});
