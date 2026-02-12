"use client";
export const dynamic = "force-dynamic"; // ensure this page is always server-rendered (for auth check)
import { useSession } from "next-auth/react";

export default function AdminPage() {
    const { data: session, status } = useSession();

    if (status === "loading") return <p>Loading...</p>;

    if (!session || !session.user.roles.includes("Admin")) {
        return <h2>❌ Access Denied: Admins only</h2>;
    }

    return (
        <div>
            <h1>✅ Admin Dashboard</h1>
            <p>Only Admin users can see this page.</p>
        </div>
    );
}
