"use client";
import { useEffect, useState } from "react";
import FechaCard from "@/components/FechaCard";

type Partido = {
  local: string;
  goles_local: number;
  visitante: string;
  goles_visitante: number;
};

type TablaStats = {
  PJ: number;
  Pts: number;
  PG: number;
  PE: number;
  PP: number;
  GF: number;
  GC: number;
};

type ExplicacionDesempate = {
  grupo: string[];
  historial: {
    nombre: string;
    codigo: string;
    valores: Record<string, number>;
  }[];
  clasificados: { equipo: string; criterio: string; puesto: number }[];
  tamaño: number;
};

export default function Home({
  division,
  año,
  torneo
}: {
  division: string;
  año: string;
  torneo: string;
}) {
  const [fechas, setFechas] = useState<Record<string, Partido[]>>({});
  const [tablaPosiciones, setTablaPosiciones] = useState<Record<string, TablaStats>>({});
  const [equipos, setEquipos] = useState<string[]>([]);
  const [equipoFiltroTabla, setEquipoFiltroTabla] = useState<string>("TODOS");
  const [explicacionesDesempate, setExplicacionesDesempate] = useState<ExplicacionDesempate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/fechas?division=${division}&año=${año}&torneo=${torneo}`);
      const data = await res.json();
      setFechas(data);

      const equiposSet = new Set<string>();
      for (const partidos of Object.values(data) as Partido[][]) {
        partidos.forEach((p) => {
          equiposSet.add(p.local);
          equiposSet.add(p.visitante);
        });
      }
      setEquipos(Array.from(equiposSet));
      setLoading(false);
    };

    fetchData();
  }, [division, año, torneo]);

  useEffect(() => {
    if (Object.keys(fechas).length === 0) return;

    const tabla: Record<string, TablaStats> = {};
    equipos.forEach((e) => {
      tabla[e] = { PJ: 0, Pts: 0, PG: 0, PE: 0, PP: 0, GF: 0, GC: 0 };
    });

    for (const partidos of Object.values(fechas)) {
      partidos.forEach((p) => {
        tabla[p.local].PJ++;
        tabla[p.visitante].PJ++;
        tabla[p.local].GF += p.goles_local;
        tabla[p.local].GC += p.goles_visitante;
        tabla[p.visitante].GF += p.goles_visitante;
        tabla[p.visitante].GC += p.goles_local;

        if (p.goles_local > p.goles_visitante) {
          tabla[p.local].PG++;
          tabla[p.local].Pts += 3;
          tabla[p.visitante].PP++;
        } else if (p.goles_local < p.goles_visitante) {
          tabla[p.visitante].PG++;
          tabla[p.visitante].Pts += 3;
          tabla[p.local].PP++;
        } else {
          tabla[p.local].PE++;
          tabla[p.visitante].PE++;
          tabla[p.local].Pts++;
          tabla[p.visitante].Pts++;
        }
      });
    }

    // Lógica avanzada simulada para generar explicaciones de desempate
    const explicaciones: ExplicacionDesempate[] = [];
    const gruposPorPuntos: Record<number, string[]> = {};

    for (const equipo in tabla) {
      const pts = tabla[equipo].Pts;
      if (!gruposPorPuntos[pts]) gruposPorPuntos[pts] = [];
      gruposPorPuntos[pts].push(equipo);
    }

    const gruposOrdenados = Object.keys(gruposPorPuntos)
      .map(Number)
      .sort((a, b) => b - a)
      .map((pts) => gruposPorPuntos[pts]);

    const ordenFinal: string[] = [];

    gruposOrdenados.forEach((grupo) => {
      if (grupo.length === 1) {
        ordenFinal.push(...grupo);
      } else {
        const historial: ExplicacionDesempate["historial"] = [];
        const clasificados: ExplicacionDesempate["clasificados"] = [];

        const sortedGrupo = [...grupo].sort(
          (a, b) => (tabla[b].GF - tabla[b].GC) - (tabla[a].GF - tabla[a].GC)
        );

        historial.push({
          nombre: "Mayor DG (diferencia de goles)",
          codigo: "DG",
          valores: Object.fromEntries(grupo.map(e => [e, tabla[e].GF - tabla[e].GC]))
        });

        sortedGrupo.forEach((e, i) =>
          clasificados.push({ equipo: e, criterio: "DG", puesto: ordenFinal.length + i + 1 })
        );

        explicaciones.push({
          grupo,
          historial,
          clasificados,
          tamaño: grupo.length
        });

        ordenFinal.push(...sortedGrupo);
      }
    });

    setExplicacionesDesempate(explicaciones);
    setTablaPosiciones(tabla);
  }, [fechas, equipos]);

  if (loading) return <div className="p-4 text-white">Cargando...</div>;

  const equiposOrdenados = Object.entries(tablaPosiciones).sort(
    ([, a], [, b]) => b.Pts - a.Pts || (b.GF - b.GC) - (a.GF - a.GC)
  );

  return (
    <main className="p-4">
      {Object.entries(fechas).map(([numero, partidos]) => (
        <FechaCard key={numero} numero={numero} partidos={partidos} />
      ))}

      <div className="flex justify-center mb-4 mt-10">
        <label htmlFor="equipoFilterTabla" className="mr-2 font-bold text-lg">
          Filtrar tabla por equipo:
        </label>
        <select
          id="equipoFilterTabla"
          value={equipoFiltroTabla}
          onChange={(e) => setEquipoFiltroTabla(e.target.value)}
          className="bg-white text-black p-1 rounded"
        >
          <option value="TODOS">Mostrar todos</option>
          {equipos.map((eq) => (
            <option key={eq} value={eq}>{eq}</option>
          ))}
        </select>
      </div>

      <div className="bg-green-900 rounded-lg shadow-inner p-4 m-4 text-white border border-green-700 max-w-3xl mx-auto">
        <h2 className="text-xl mb-2 font-bold text-center">Tabla de Posiciones</h2>
        <table className="table-auto border-collapse text-sm text-white mx-auto tabla-posiciones-limitada">
          <thead>
            <tr className="bg-green-700">
              <th className="border px-2 py-1 text-center whitespace-nowrap">#</th>
              <th className="border px-2 py-1 text-center whitespace-nowrap">Equipo</th>
              <th className="border px-2 py-1 text-center whitespace-nowrap">PJ</th>
              <th className="border px-2 py-1 text-center whitespace-nowrap">Pts</th>
              <th className="border px-2 py-1 text-center whitespace-nowrap">PG</th>
              <th className="border px-2 py-1 text-center whitespace-nowrap">PE</th>
              <th className="border px-2 py-1 text-center whitespace-nowrap">PP</th>
              <th className="border px-2 py-1 text-center whitespace-nowrap">GF</th>
              <th className="border px-2 py-1 text-center whitespace-nowrap">GC</th>
              <th className="border px-2 py-1 text-center whitespace-nowrap">DG</th>
            </tr>
          </thead>
          <tbody>
            {equiposOrdenados
              .filter(([equipo]) =>
                equipoFiltroTabla === "TODOS" || equipoFiltroTabla === equipo
              )
              .map(([equipo, stats], index) => (
                <tr key={equipo}>
                  <td className="border px-2 py-1 text-center">{index + 1}</td>
                  <td className="border px-2 py-1 ">{equipo}</td>
                  <td className="border px-2 py-1 text-center">{stats.PJ}</td>
                  <td className="border px-2 py-1 text-center">{stats.Pts}</td>
                  <td className="border px-2 py-1 text-center">{stats.PG}</td>
                  <td className="border px-2 py-1 text-center">{stats.PE}</td>
                  <td className="border px-2 py-1 text-center">{stats.PP}</td>
                  <td className="border px-2 py-1 text-center">{stats.GF}</td>
                  <td className="border px-2 py-1 text-center">{stats.GC}</td>
                  <td className="border px-2 py-1 text-center">{stats.GF - stats.GC}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {explicacionesDesempate.length > 0 && (
        <div className="mt-8 p-4 bg-slate-800 text-white rounded-md max-w-4xl mx-auto">
          <h3 className="text-lg font-bold mb-2">Desempates aplicados</h3>
          <ul className="list-disc pl-5">
            {explicacionesDesempate.map((exp, idx) => (
              <li key={idx} className="mb-4">
                <b>{exp.grupo.join(", ")}</b>
                <div className="mt-2 overflow-auto">
                  <table className="table-auto text-xs border-collapse w-full">
                    <thead>
                      <tr>
                        <th className="border p-1 bg-slate-700 text-left">Criterio</th>
                        {exp.grupo.map((e) => (
                          <th key={e} className="border p-1 bg-slate-700">{e}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {exp.historial.map((paso, i) => (
                        <tr key={i}>
                          <td className="border p-1 bg-slate-600">{paso.nombre}</td>
                          {exp.grupo.map((e) => (
                            <td key={e} className="border p-1 text-center">
                              {paso.valores[e]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-sm text-green-300">
                  {exp.clasificados.map((c, i) => (
                    <div key={i}>
                      <b>{c.equipo}</b> - Clasifica {c.puesto}° por desempate {c.criterio}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
