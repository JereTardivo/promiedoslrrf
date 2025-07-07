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

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/fechas");
      const data = await res.json();
      setFechas(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-white">Cargando...</div>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">Torneo Apertura 2025</h1>
      {Object.entries(fechas).map(([numero, partidos]) => (
        <FechaCard key={numero} numero={numero} partidos={partidos} />
      ))}
    </main>
  );
}
