import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { AnnouncementBanner } from '@/components/announcement-banner';
import { renderWithProviders } from '@test/fixtures/testHelpers';

vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

describe('AnnouncementBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should not render when loading', () => {
    global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves

    renderWithProviders(
      <AnnouncementBanner apiEndpoint="/api/test/announcements" />
    );

    expect(screen.queryByText(/announcement/i)).not.toBeInTheDocument();
  });

  it('should not render when no announcements', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      } as Response)
    );

    renderWithProviders(
      <AnnouncementBanner apiEndpoint="/api/test/announcements" />
    );

    await waitFor(() => {
      expect(screen.queryByText(/announcement/i)).not.toBeInTheDocument();
    });
  });

  it('should render active announcements', async () => {
    const mockAnnouncements = [
      {
        id: 'announcement-1',
        title: 'Test Announcement',
        content: 'Test content',
        type: 'info',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockAnnouncements),
      } as Response)
    );

    renderWithProviders(
      <AnnouncementBanner apiEndpoint="/api/test/announcements" />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Announcement')).toBeInTheDocument();
    });
  });

  it('should allow dismissing announcements', async () => {
    const mockAnnouncements = [
      {
        id: 'announcement-1',
        title: 'Test Announcement',
        content: 'Test content',
        type: 'info',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockAnnouncements),
      } as Response)
    );

    renderWithProviders(
      <AnnouncementBanner apiEndpoint="/api/test/announcements" />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Announcement')).toBeInTheDocument();
    });

    // Dismiss button should be present
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    expect(dismissButton).toBeInTheDocument();
  });
});

