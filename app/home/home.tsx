import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "~/hooks/useAuth";
import { apiFetch } from "api/apiFetch";
import { Link } from "react-router";
import { FaHeart, FaRegHeart } from "react-icons/fa";

type Ingrediente = {
  id: number;
  nombre: string;
  kcal: number;
  cantidad: number;
};

type Plato = {
  id: number;
  nombre: string;
  kcalTotal: number;
  ingredientes: Ingrediente[];
};

type CategoriaComida = {
  id: number;
  nombre: string;
  platos: Plato[];
};

// --- FUNCIONES AUXILIARES ---
function getKcalPriority(kcal: number) {
  if (kcal >= 150) return 1;
  if (kcal >= 50) return 2;
  return 3;
}

function getKcalColor(kcal: number) {
  if (kcal >= 150) return "text-red-600";
  if (kcal >= 50) return "text-yellow-600";
  return "text-green-600";
}

function getPlatoPriority(kcal: number) {
  if (kcal >= 500) return 1;
  if (kcal >= 251) return 2;
  return 3;
}

function getPlatoBgColor(kcal: number) {
  if (kcal >= 500) return "bg-red-300 hover:bg-red-400";
  if (kcal >= 251) return "bg-yellow-300 hover:bg-yellow-400";
  return "bg-green-300 hover:bg-green-400";
}

async function getFood(): Promise<CategoriaComida[]> {
  const res = await apiFetch<CategoriaComida[]>("/categorias-comida", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return res;
}

async function getFavorites(): Promise<CategoriaComida[]> {
  const res = await apiFetch<CategoriaComida[]>("/favoritos", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });
  return res;
}

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [selectedCategoria, setSelectedCategoria] =
    useState<CategoriaComida | null>(null);
  const [selectedPlato, setSelectedPlato] = useState<Plato | null>(null);
  const [favoritos, setFavoritos] = useState<number[]>([]); 

  const { data: categorias = [], isLoading, isPending, isFetching, isError } =
    useQuery({
      queryKey: ["categoriasComida"],
      queryFn: getFood,
      retry: false,
    });

  const { data: favoritosData = [], refetch: refetchFavoritos } = useQuery({
    queryKey: ["favoritos"],
    queryFn: getFavorites,
    retry: false,
    enabled: !!isLoggedIn,
  });

   useEffect(() => {
    if (favoritosData && Array.isArray(favoritosData)) {
      const ids = favoritosData.map((f) => f.id);
      setFavoritos(ids);
    }
  }, [favoritosData]);

   const toggleFavorito = async (platoId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const esFavorito = favoritos.includes(platoId);

    try {
      if (esFavorito) {
        await apiFetch(`/favoritos/${platoId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
      } else {
        await apiFetch(`/favoritos/${platoId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
      }

      // 🔁 Refrescar lista de favoritos desde backend
      refetchFavoritos();
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
    }
  };

  if (isPending || isLoading || isFetching) {
    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div>Cargando...</div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div className="max-w-[400px] w-full px-4 text-center text-gray-700 space-y-4">
          <p>Por favor inicia sesión para ver el dashboard.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-2">
            <Link
              to="/login"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/sign-up"
              className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div>Error al cargar los datos.</div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
        <div className="max-w-[600px] w-full px-4">
          {/* NIVEL 1: Categorías */}
          {!selectedCategoria && (
            <div className="grid grid-cols-1 gap-4">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoria(cat)}
                  className="w-full p-4 bg-blue-100 hover:bg-blue-200 rounded shadow text-left"
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          )}

          {/* NIVEL 2: Platos */}
          {selectedCategoria && !selectedPlato && (
            <div>
              <button
                onClick={() => setSelectedCategoria(null)}
                className="mb-4 text-blue-500 hover:underline"
              >
                ← Volver a categorías
              </button>
              <h2 className="text-xl font-semibold mb-4">
                {selectedCategoria.nombre}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {selectedCategoria.platos
                  .slice()
                  .sort(
                    (a, b) =>
                      getPlatoPriority(a.kcalTotal) -
                      getPlatoPriority(b.kcalTotal)
                  )
                  .map((plato) => (
                    <button
                      key={plato.id}
                      onClick={() => setSelectedPlato(plato)}
                      className={`relative flex justify-between items-center w-full p-4 rounded shadow text-left text-black ${getPlatoBgColor(
                        plato.kcalTotal
                      )}`}
                    >
                      <div>
                        <p className="font-semibold">{plato.nombre}</p>
                        <p className="text-sm">{plato.kcalTotal} kcal</p>
                      </div>

                      {/* ❤️ Botón de favorito */}
                      <button
                        onClick={(e) => toggleFavorito(plato.id, e)}
                        className="text-xl transition-transform transform hover:scale-110"
                      >
                        {favoritos.includes(plato.id) ? (
                          <FaHeart className="text-red-500" />
                        ) : (
                          <FaRegHeart className="text-gray-600" />
                        )}
                      </button>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* NIVEL 3: Ingredientes */}
          {selectedPlato && (
            <div>
              <button
                onClick={() => setSelectedPlato(null)}
                className="mb-4 text-blue-500 hover:underline"
              >
                ← Volver a platos
              </button>
              <h2 className="text-xl font-semibold mb-4">
                {selectedPlato.nombre}
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                {selectedPlato.ingredientes
                  .slice()
                  .sort(
                    (a, b) => getKcalPriority(a.kcal) - getKcalPriority(b.kcal)
                  )
                  .map((ing) => (
                    <li key={ing.id} className={getKcalColor(ing.kcal)}>
                      {ing.nombre} - {ing.kcal} kcal - {ing.cantidad} g
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
