// ─── App Providers ─────────────────────────────────────────────────────────
// Wraps the whole app in required providers.

import React from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Future providers: AuthProvider, ThemeProvider, ToastProvider
  return <>{children}</>
}
