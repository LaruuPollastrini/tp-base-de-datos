import type { Route } from "./+types/login";
import { Login } from "../auth/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function LoginPage() {
  return <Login />;
}
