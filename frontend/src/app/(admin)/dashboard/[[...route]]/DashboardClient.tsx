"use client";

import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("@/admin/AdminApp"), {
  ssr: false,
});

export default function DashboardClient() {
  return <AdminApp />;
}
