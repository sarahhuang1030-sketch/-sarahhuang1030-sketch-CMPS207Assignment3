"use client";

import { useSession } from "next-auth/react";

export default function UserPage() {
    const { data: session } = useSession();

    if (!session) {
        return <p>Please login first.</p>;
    }

    return (
        <div>
            <h1>User Page</h1>
            <p>Your role(s): {session.user.roles.join(", ")}</p>
        </div>
    );
}
