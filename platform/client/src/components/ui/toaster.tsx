import { useState } from "react"
import type { ReactNode } from "react"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Button } from "@/components/ui/button"

export function Toaster() {
  const { toasts } = useToast()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyErrorText = (id: string, title?: ReactNode, description?: ReactNode) => {
    const titleText = typeof title === "string" ? title : title?.toString() || ""
    const descText = typeof description === "string" ? description : description?.toString() || ""
    const fullText = [titleText, descText].filter(Boolean).join("\n")
    
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }).catch((err) => {
      console.error("Failed to copy:", err)
    })
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isError = variant === "destructive"
        const isCopied = copiedId === id

        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            {isError && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-10 top-2 h-6 w-6 text-destructive-foreground/70 hover:text-destructive-foreground hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive-foreground focus:ring-offset-2 focus:ring-offset-destructive"
                onClick={() => copyErrorText(id, title, description)}
                data-testid={`button-copy-error-${id}`}
                aria-label="Copy error message"
              >
                {isCopied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
