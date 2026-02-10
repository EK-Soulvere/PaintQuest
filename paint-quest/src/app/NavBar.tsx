'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
    { href: '/', label: 'Home' },
    { href: '/sessions', label: 'Sessions' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/plan', label: 'Plan' },
    { href: '/profile', label: 'Profile' },
    { href: '/arsenal', label: 'Arsenal' },
    { href: '/review', label: 'Review' },
]

export default function NavBar() {
    const pathname = usePathname()
    if (pathname === '/auth') return null

    return (
        <nav className="w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-4 items-center">
                <Link href="/" className="text-[var(--color-primary)] font-semibold">
                    PaintQuest
                </Link>
                <div className="flex flex-wrap gap-3 text-sm">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-1 rounded-md border ${
                                pathname === link.href
                                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                                    : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    )
}
