import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { auth } from "@/auth"
import { SessionProvider } from "next-auth/react"
import Navbar from "@/components/Navbar"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pushup Challenge",
  description: "30denní výzva v klikách",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="cs">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <SessionProvider session={session}>
          <Navbar />
          <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
