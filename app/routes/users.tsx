import UsersListPage from "~/home/users";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Users List" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function UsersPage() {
  return <UsersListPage />;
}
