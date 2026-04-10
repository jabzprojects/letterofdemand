import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Letter of Demand',
  description: 'Generate a formal letter of demand in minutes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
