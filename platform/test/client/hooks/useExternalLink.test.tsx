import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useExternalLink } from '@/hooks/useExternalLink';

describe('useExternalLink', () => {
  const originalLocation = window.location;
  const originalClipboard = navigator.clipboard;

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
    // Restore original clipboard
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    }
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

  it('should open internal links directly without dialog for relative paths', () => {
    const { result } = renderHook(() => useExternalLink());
    const internalUrl = '/apps/directory/public';

    act(() => {
      result.current.openExternal(internalUrl);
    });

    // Internal links should open directly without showing dialog
    expect(window.open).toHaveBeenCalledWith(internalUrl, '_blank', 'noopener,noreferrer');
    
    // Dialog should not be open for internal links
    const { ExternalLinkDialog } = result.current;
    render(<ExternalLinkDialog />);
    expect(screen.queryByText(/open link in new window/i)).not.toBeInTheDocument();
  });

  it('should open internal links directly without dialog for same-origin absolute URLs', () => {
    const { result } = renderHook(() => useExternalLink());
    const internalUrl = 'https://the-comic.com/apps/directory/public';

    act(() => {
      result.current.openExternal(internalUrl);
    });

    // Internal links should open directly without showing dialog
    expect(window.open).toHaveBeenCalledWith(internalUrl, '_blank', 'noopener,noreferrer');
    
    // Dialog should not be open for internal links
    const { ExternalLinkDialog } = result.current;
    render(<ExternalLinkDialog />);
    expect(screen.queryByText(/open link in new window/i)).not.toBeInTheDocument();
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

  it('should show copy button for external links in dialog', () => {
    const { result } = renderHook(() => useExternalLink());

    act(() => {
      result.current.openExternal('https://example.com');
    });

    const { ExternalLinkDialog } = result.current;
    render(<ExternalLinkDialog />);
    
    // Dialog should show external link title
    expect(screen.getByText(/open external link/i)).toBeInTheDocument();
    // Copy button should be present
    expect(screen.getByRole('button', { name: /copy url/i })).toBeInTheDocument();
  });

  it('should copy URL when copy button is clicked in external link dialog', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useExternalLink());
    const testUrl = 'https://example.com/test-page';
    
    // Mock clipboard API - use defineProperty since clipboard is read-only
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    act(() => {
      result.current.openExternal(testUrl);
    });

    const { ExternalLinkDialog } = result.current;
    render(<ExternalLinkDialog />);

    const copyButton = screen.getByRole('button', { name: /copy url/i });
    await user.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith(testUrl);
    expect(screen.getByText(/copied/i)).toBeInTheDocument();
  });
});

