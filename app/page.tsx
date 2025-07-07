"use client";
import { useEffect, useState } from "react";
import FechaCard from "@/components/FechaCard";

type Partido = {
  local: string;
  goles_local: number;
  visitante: string;
  goles_visitante: number;
  escudo_local?: string;
  escudo_visitante?: string;
};

export default function Home() {
  const [fechas, setFechas] = useState<Record<string, Partido[]>>({});
  const [loading, setLoading] = useState(true);

  // estados dinámicos para los select
  const [año, setAño] = useState("2025");
  const [torneo, setTorneo] = useState("Apertura");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/fechas?año=${año}&torneo=${torneo}`);
      const data = await res.json();
      setFechas(data);
      setLoading(false);
    };
    fetchData();
  }, [año, torneo]); // cada vez que cambia año o torneo, recarga datos

  return (
    <main className="p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          Primera División {año} - {torneo}
        </h1>
        <div className="flex gap-2">
          <select
            className="bg-green-800 text-white px-3 py-1 rounded"
            value={año}
            onChange={(e) => setAño(e.target.value)}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <select
            className="bg-green-800 text-white px-3 py-1 rounded"
            value={torneo}
            onChange={(e) => setTorneo(e.target.value)}
          >
            <option value="Apertura">Apertura</option>
            <option value="Clausura">Clausura</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-white">Cargando...</div>
      ) : (
        Object.entries(fechas).map(([numero, partidos]) => (
          <FechaCard key={numero} numero={numero} partidos={partidos} />
        ))
      )}
    </main>
  );
}
