import SignUp from "~/auth/signUp";
import type { Route } from "./+types/sign-up";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Registro" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function SignUpPage() {
  return <SignUp />;
}
