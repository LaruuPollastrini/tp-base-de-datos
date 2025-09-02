import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "api/apiFetch";
import { useNavigate } from "react-router";

type RegisterInput = {
  email: string;
  password: string;
};

type RegisterResponse = {
  token: string;
};

async function registerUser(data: RegisterInput): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const resetFields = () => {
    setPassword("");
    setEmail("");
    setConfirmPassword("");
  };

  const mutation = useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: registerUser,
    onSuccess: (_data) => {
      resetFields();
      navigate("/sign-up");
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(
        "Las contraseñas no coinciden, por favor verifica que sean iguales."
      );
      return;
    }
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
              Register
            </h2>

            <div className="flex flex-col space-y-3">
              <label className="text-gray-600 dark:text-gray-300">Email</label>
              <input
                autoComplete="off"
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
                autoComplete="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-gray-600 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                autoComplete="new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
