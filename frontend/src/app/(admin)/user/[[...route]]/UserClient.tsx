"use client";

import dynamic from "next/dynamic";

const UserApp = dynamic(() => import("@/user/UserApp"), {
  ssr: false,
});

export default function UserClient() {
  return <UserApp />;
}
