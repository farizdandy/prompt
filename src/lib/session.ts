import {useSession} from '@tanstack/react-start/server'

type SessionData = {
  userId?: string
}

export function useAppSession() {
    const session = useSession<SessionData>({
        name: 'app-session',
        password: process.env.SESSION_SECRET!,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: true,
        }
    })
    return session
}