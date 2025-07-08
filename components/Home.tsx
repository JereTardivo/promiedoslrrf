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

    // Simulación desempate simple
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
          className="text-black p-1 rounded"
        >
          <option value="TODOS">Mostrar todos</option>
          {equipos.map((eq) => (
            <option key={eq} value={eq}>{eq}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <h2 className="text-xl mb-2 font-bold text-center">Tabla de Posiciones</h2>
        <table className="table-auto border-collapse text-sm text-white mx-auto tabla-posiciones-limitada">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-center">#</th>
              <th className="border px-2 py-1 text-center">Equipo</th>
              <th className="border px-2 py-1 text-center">PJ</th>
              <th className="border px-2 py-1 text-center">Pts</th>
              <th className="border px-2 py-1 text-center">PG</th>
              <th className="border px-2 py-1 text-center">PE</th>
              <th className="border px-2 py-1 text-center">PP</th>
              <th className="border px-2 py-1 text-center">GF</th>
              <th className="border px-2 py-1 text-center">GC</th>
              <th className="border px-2 py-1 text-center">DG</th>
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
                  <td className="border px-2 py-1 text-center">{equipo}</td>
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
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cuadro de clasificación */}
      {equiposOrdenados.length >= 7 && (
        <div className="mt-10 max-w-5xl mx-auto p-4 bg-slate-800 text-white rounded">
          <h2 className="text-xl font-bold mb-6 text-center">Cuadro de Clasificación</h2>
          <div className="flex flex-col items-center space-y-8">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <div className="border px-4 py-2 rounded bg-yellow-400 text-black font-bold">
                  1º {equiposOrdenados[0][0]}
                </div>
                <div className="text-xs mt-1">Semifinal directo</div>
              </div>
              <div className="border-t-2 border-l-2 border-white h-12 w-8"></div>
              <div className="border px-4 py-2 rounded">Ganador 2º vs 7º</div>
            </div>

            <div className="border-t-2 w-32 my-4"></div>

            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  <div className="border px-4 py-2 rounded">{equiposOrdenados[3][0]}</div>
                  <span className="mx-1">vs</span>
                  <div className="border px-4 py-2 rounded">{equiposOrdenados[4][0]}</div>
                </div>
                <div className="text-xs mt-1">Cuartos de final</div>
              </div>
              <div className="border-t-2 border-l-2 border-white h-12 w-8"></div>
              <div className="border px-4 py-2 rounded">Ganador semi</div>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <div className="border px-4 py-2 rounded">{equiposOrdenados[2][0]}</div>
              <span className="mx-1">vs</span>
              <div className="border px-4 py-2 rounded">{equiposOrdenados[5][0]}</div>
            </div>
            <div className="text-xs">Cuartos de final</div>
          </div>
        </div>
      )}
    </main>
  );
}
