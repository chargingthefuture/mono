import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useExternalLink } from '@/hooks/useExternalLink';

describe('useExternalLink', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open
    window.open = vi.fn();
    // Mock window.location.origin for internal link detection
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        origin: 'https://the-comic.com',
        href: 'https://the-comic.com/apps/directory',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should initialize with closed dialog', () => {
    const { result } = renderHook(() => useExternalLink());

    expect(result.current).toBeDefined();
    expect(result.current.openExternal).toBeDefined();
    expect(result.current.ExternalLinkDialog).toBeDefined();
  });

  it('should show external link dialog for external URLs', () => {
    const { result } = renderHook(() => useExternalLink());

    act(() => {
      result.current.openExternal('https://signal.org');
    });

    const { ExternalLinkDialog } = result.current;
    render(<ExternalLinkDialog />);
    
    // Dialog should show external link title and description
    expect(screen.getByText(/open external link/i)).toBeInTheDocument();
    expect(screen.getByText(/take you to an external site/i)).toBeInTheDocument();
  });

  it('should show internal link dialog for relative paths', () => {
    const { result } = renderHook(() => useExternalLink());

    act(() => {
      result.current.openExternal('/apps/directory/public');
    });

    const { ExternalLinkDialog } = result.current;
    render(<ExternalLinkDialog />);
    
    // Dialog should show internal link title and description
    expect(screen.getByText(/open link in new window/i)).toBeInTheDocument();
    expect(screen.getByText(/another page within this application/i)).toBeInTheDocument();
  });

  it('should show internal link dialog for same-origin absolute URLs', () => {
    const { result } = renderHook(() => useExternalLink());

    act(() => {
      result.current.openExternal('https://the-comic.com/apps/directory/public');
    });

    const { ExternalLinkDialog } = result.current;
    render(<ExternalLinkDialog />);
    
    // Dialog should show internal link title and description
    expect(screen.getByText(/open link in new window/i)).toBeInTheDocument();
    expect(screen.getByText(/another page within this application/i)).toBeInTheDocument();
  });

  it('should open link in new window when confirmed', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useExternalLink());
    const testUrl = 'https://example.com';

    act(() => {
      result.current.openExternal(testUrl);
    });

    const { ExternalLinkDialog } = result.current;
    render(<ExternalLinkDialog />);

    const confirmButton = screen.getByRole('button', { name: /open link/i });
    await user.click(confirmButton);

    expect(window.open).toHaveBeenCalledWith(testUrl, '_blank', 'noopener,noreferrer');
  });

  it('should close dialog when canceled', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useExternalLink());

    act(() => {
      result.current.openExternal('https://example.com');
    });

    const { ExternalLinkDialog } = result.current;
    render(<ExternalLinkDialog />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(window.open).not.toHaveBeenCalled();
  });

  it('should display URL in dialog', () => {
    const { result } = renderHook(() => useExternalLink());
    const testUrl = 'https://example.com/test-page';

    act(() => {
      result.current.openExternal(testUrl);
    });

    const { ExternalLinkDialog } = result.current;
    render(<ExternalLinkDialog />);

    expect(screen.getByText(testUrl)).toBeInTheDocument();
  });
});

