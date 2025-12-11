import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ClerkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log Clerk errors but don't block the app
    const errorMessage = error?.message || error?.toString() || '';
    if (errorMessage.toLowerCase().includes('clerk') || errorInfo?.componentStack?.includes('Clerk')) {
      // Silently handle Clerk errors - they're non-blocking
      // The landing page will still work
      if (process.env.NODE_ENV === 'development') {
        console.warn('Clerk initialization warning (non-blocking):', errorMessage);
      }
      return;
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    // Always render children - even if Clerk has errors
    // The app will work, authentication just won't be available until fixed
    return this.props.children;
  }
}

