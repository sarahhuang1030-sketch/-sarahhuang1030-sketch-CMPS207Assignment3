"use client";

import { useSession } from "next-auth/react";

export default function UserPage() {
  const sessionHook = useSession();
  const session = sessionHook?.data;

  if (!session) {
    return <p>Please login first.</p>;
  }

  const roles = session?.user?.roles ?? [];

  return (
    <div>
      <h1>User Page</h1>
      <p>Your role(s): {roles.join(", ") || "none"}</p>
    </div>
  );
}
