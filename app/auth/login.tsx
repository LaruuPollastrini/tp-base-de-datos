import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "api/apiFetch";
import { useNavigate } from "react-router";

async function loginUser(data: { email: string; password: string }) {
  try {
    const res = await apiFetch<{ token: string }>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res;
  } catch (error) {
    throw new Error("Invalid Credentials");
  }
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const resetFields = () => {
    setPassword("");
    setEmail("");
  };

  const mutation = useMutation<
    { token: string },
    Error,
    { email: string; password: string }
  >({
    mutationFn: loginUser,
    onSuccess: (data) => {
      window.localStorage.setItem("token", data.token);
      resetFields();
      navigate("/");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <div className="max-w-[400px] w-full px-4">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 text-center">
              Login
            </h2>

            <div className="flex flex-col space-y-3">
              <label className="text-gray-600 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-gray-600 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
