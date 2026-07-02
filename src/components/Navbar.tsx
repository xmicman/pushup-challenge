"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-900 text-lg">
          💪 Pushup Challenge
        </Link>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                {session.user.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? ""}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                )}
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Odhlásit
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700"
            >
              Přihlásit přes Google
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
