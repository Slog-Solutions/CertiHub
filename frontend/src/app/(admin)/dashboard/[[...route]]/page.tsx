import DashboardClient from "./DashboardClient";

export async function generateStaticParams() {
  return [
    { route: [] }
  ];
}

export default function DashboardPage() {
  return <DashboardClient />;
}
