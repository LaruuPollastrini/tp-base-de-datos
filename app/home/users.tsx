import { useQuery } from "@tanstack/react-query";
import { useAuth } from "~/hooks/useAuth";
import { apiFetch } from "api/apiFetch";

type Usuario = {
  id: number;
  email: number;
  role: "admin" | "user";
};

// Función para pegar al endpoint
async function getUsers(): Promise<Usuario[]|{message: string;} > {
  const res = await apiFetch<Usuario[]|{message: string;}>("/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res;
}

export default function UsersListPage() {
  const { isLoggedIn } = useAuth();

  const {
    data: usuarios = [],
    isFetching,
    isError,
    isLoading,
    isPending
  } = useQuery({
    queryKey: ["listaUsuarios"],
    queryFn: getUsers,
    retry: false,
    enabled: !!isLoggedIn,
  });

  if (isPending || isLoading || isFetching) {
    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div>Cargando...</div>
      </main>
    );
  }

  if ('message' in usuarios && !isFetching) {
    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div>Acceso no autorizado</div>
      </main>
    );
  }

  if (isError && !isFetching) {
    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div>Error al cargar los datos.</div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
        <div className="max-w-[800px] w-full px-4">
          {/* Nivel 1: Tabla de Usuarios */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Rol
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Fav
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(usuarios) && usuarios?.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-blue-50">
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {usuario.id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {usuario.email}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {usuario.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
