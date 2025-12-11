import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/login-form';
import { render } from '@testing-library/react';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('should render sign in and sign up buttons', () => {
    render(<LoginForm />);

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it('should show confirmation dialog when sign in clicked', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const signInButton = screen.getByText(/sign in/i);
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/redirecting to accounts portal/i)).toBeInTheDocument();
    });
  });

  it('should show confirmation dialog when sign up clicked', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const signUpButton = screen.getByText(/create account/i);
    await user.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText(/redirecting to accounts portal/i)).toBeInTheDocument();
    });
  });

  it('should allow canceling redirect', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const signInButton = screen.getByText(/sign in/i);
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/redirecting to accounts portal/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByTestId('button-cancel-redirect');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/redirecting to accounts portal/i)).not.toBeInTheDocument();
    });
  });
});

