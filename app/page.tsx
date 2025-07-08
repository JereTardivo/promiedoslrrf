"use client";
import { useState } from "react";
import Home from "@/components/Home";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  const [division, setDivision] = useState("primera_division");
  const [año, setAño] = useState("2025");
  const [torneo, setTorneo] = useState("Apertura");

  return (
    <div className="flex">
      {/* Sidebar lateral */}
      <aside className="bg-green-900 w-64 p-4 h-screen fixed left-0 top-0">
        <Link href="/">
          <Image
            src="/lrrf-logo.png"
            alt="Promiedos LRRF"
            width={240}
            height={120}
            className="w-32 md:w-48 h-auto hover:opacity-80 transition-opacity"
          />
        </Link>
        <br />
        <br />
        <h2 className="text-xl font-bold mb-4">Filtros</h2>

        <div className="mb-4">
          <label className="block mb-1">División</label>
          <select
            className="w-full p-2 bg-green-700 rounded"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          >
            <option value="primera_division">Primera</option>
            <option value="reserva">Reserva</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Año</label>
          <select
            className="w-full p-2 bg-green-700 rounded"
            value={año}
            onChange={(e) => setAño(e.target.value)}
          >
            <option value="2025">2025</option>
            {/* podés añadir más años dinámicamente luego */}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Torneo</label>
          <select
            className="w-full p-2 bg-green-700 rounded"
            value={torneo}
            onChange={(e) => setTorneo(e.target.value)}
          >
            <option value="Apertura">Apertura</option>
            <option value="Clausura">Clausura</option>
          </select>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="ml-64 p-6 flex-1">
        <h1 className="text-3xl text-center font-bold mb-6">
          {division === "primera_division" ? "Primera División" : "Reserva"} {año} - {torneo}
        </h1>

        {/* Pasamos props a Home para que haga el fetch con estos filtros */}
        <Home division={division} año={año} torneo={torneo} />
      </main>
    </div>
  );
}
