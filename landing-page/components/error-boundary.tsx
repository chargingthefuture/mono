'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full border-[4px] border-foreground bg-card p-6 sm:p-8 text-center">
        <h2 className="font-[var(--font-bangers)] text-2xl sm:text-3xl md:text-4xl mb-4 text-foreground">
          SOMETHING WENT WRONG
        </h2>
        <p className="font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground mb-6">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="font-[var(--font-inter)] text-xs text-muted-foreground cursor-pointer mb-2">
              Error details (development only)
            </summary>
            <pre className="text-xs bg-secondary p-3 border-[2px] border-foreground overflow-auto max-h-40">
              {error.message}
              {'\n'}
              {error.stack}
            </pre>
          </details>
        )}
        <Button
          onClick={resetError}
          className="font-[var(--font-bangers)] text-base sm:text-lg px-6 py-3 bg-foreground text-background hover:bg-accent hover:text-foreground border-[3px] border-foreground"
        >
          TRY AGAIN
        </Button>
      </div>
    </div>
  )
}

