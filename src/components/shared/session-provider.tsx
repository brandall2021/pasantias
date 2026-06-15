"use client"

import { useSession } from "next-auth/react"

function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  const { data: _data } = useSession()
  return <>{children}</>
}

export { SessionProvider }
