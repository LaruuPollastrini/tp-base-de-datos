import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "~/hooks/useAuth";
import { apiFetch } from "api/apiFetch";
import { Link } from "react-router";

type Ingrediente = {
  id: number;
  nombre: string;
  kcal: number;
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

// Prioridad para ingredientes: rojo=1, amarillo=2, verde=3
function getKcalPriority(kcal: number) {
  if (kcal >= 150) return 1; // rojo
  if (kcal >= 50) return 2; // amarillo
  return 3; // verde
}

// Color de ingredientes
function getKcalColor(kcal: number) {
  if (kcal >= 150) return "text-red-600";
  if (kcal >= 50) return "text-yellow-600";
  return "text-green-600";
}

// Prioridad para platos: rojo ≥500, amarillo 251–499, verde ≤250
function getPlatoPriority(kcal: number) {
  if (kcal >= 500) return 1; // rojo
  if (kcal >= 251) return 2; // amarillo
  return 3; // verde
}

// Función para color de fondo del plato según kcalTotal
function getPlatoBgColor(kcal: number) {
  if (kcal >= 500) return "bg-red-300 hover:bg-red-400";
  if (kcal >= 251) return "bg-yellow-300 hover:bg-yellow-400";
  return "bg-green-300 hover:bg-green-400";
}

// Función para pegar al endpoint
async function getFood(): Promise<CategoriaComida[]> {
  const res = await apiFetch<CategoriaComida[]>("/categorias-comida", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return res;
}

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [selectedCategoria, setSelectedCategoria] =
    useState<CategoriaComida | null>(null);
  const [selectedPlato, setSelectedPlato] = useState<Plato | null>(null);

  const {
    data: categorias = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categoriasComida"],
    queryFn: getFood,
  });

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
              Iniciar Sesion
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

  if (isLoading) {
    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div>Cargando...</div>
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
          {/* Nivel 1: Categorías */}
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

          {/* Nivel 2: Platos */}
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
                      className={`w-full p-4 rounded shadow text-left text-black ${getPlatoBgColor(
                        plato.kcalTotal
                      )}`}
                    >
                      {plato.nombre} - {plato.kcalTotal} kcal
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Nivel 3: Ingredientes */}
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
                      {ing.nombre} - {ing.kcal} kcal
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
