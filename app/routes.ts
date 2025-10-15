import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/users", "routes/users.tsx"),
  route("/sign-up", "routes/sign-up.tsx"),
  route("/login", "routes/login.tsx"),
] satisfies RouteConfig;
