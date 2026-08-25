import DashboardClient from "./DashboardClient";

export async function generateStaticParams() {
  return [
    { route: [] },
    { route: ["masters"] },
    { route: ["mentors"] },
    { route: ["users"] },
    { route: ["batches"] },
    { route: ["registration"] },
    { route: ["course-links"] },
    { route: ["fees"] },
    { route: ["discounts"] },
    { route: ["enquiries"] },
    { route: ["certificates"] },
    { route: ["notifications"] },
    { route: ["courses"] },
    { route: ["backup"] },
    { route: ["reports"] },
    { route: ["reports", "fee-collection"] },
    { route: ["reports", "date-wise-fee"] },
    { route: ["reports", "course"] },
    { route: ["reports", "course-students"] }
  ];
}

export default function DashboardPage() {
  return <DashboardClient />;
}
