import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Beer Counter',
  description: 'Track your beer and cachaça consumption',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

