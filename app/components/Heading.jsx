"use client";

import Link from "next/link";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

function NavContent() {
    const { data: session } = useSession();

    return (
        <nav className="bg-blue-600 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-1">
                <div className="flex justify-between items-center py-4">
                    <Link href="/" className="text-white text-xl font-bold">
                        Assignment 3
                    </Link>

                    <div className="space-x-6 text-white flex items-center">
                        <Link href="/" className="hover:text-blue-200">
                            Home
                        </Link>

                        <Link href="/form" className="hover:text-blue-200">
                            Student Registration Form
                        </Link>

                        {!session ? (
                            <button
                                onClick={() => signIn("azure-ad")}
                                className="bg-white text-blue-600 px-3 py-1 rounded"
                            >
                                Login
                            </button>
                        ) : (
                            <>
                <span className="text-sm mr-2">
                  {session.user.email} ({session.user.roles?.join(", ")})
                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="bg-red-500 px-3 py-1 rounded text-white"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default function Heading() {
    return (
        <SessionProvider>
            <NavContent />
        </SessionProvider>
    );
}
