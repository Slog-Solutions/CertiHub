import UserClient from "./UserClient";

export async function generateStaticParams() {
  return [
    { route: [] },                                    // /user
    { route: ['login'] },                             // /user/login
    { route: ['student', 'dashboard'] },              // /user/student/dashboard
    { route: ['teacher', 'dashboard'] },              // /user/teacher/dashboard
  ];
}

export default function UserPage() {
  return <UserClient />;
}
