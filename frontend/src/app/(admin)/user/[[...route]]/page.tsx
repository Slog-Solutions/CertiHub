import UserClient from "./UserClient";

export async function generateStaticParams() {
  return [
    { route: [] }
  ];
}

export default function UserPage() {
  return <UserClient />;
}
