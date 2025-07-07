import Image from "next/image";

type Partido = {
  local: string;
  goles_local: number;
  visitante: string;
  goles_visitante: number;
  escudo_local?: string;
  escudo_visitante?: string;
};

type FechaCardProps = {
  numero: string;
  partidos: Partido[];
};

export default function FechaCard({ numero, partidos }: FechaCardProps) {
  return (
    <div className="bg-green-900 rounded-lg shadow-inner p-4 m-4 text-white border border-green-700">
      <h2 className="text-lg font-bold mb-3">FECHA {numero}</h2>
      <table className="w-full text-center">
        <thead>
          <tr className="bg-green-700">
            <th className="py-2">LOCAL</th>
            <th className="py-2">RESULTADO</th>
            <th className="py-2">VISITANTE</th>
          </tr>
        </thead>
        <tbody>
          {partidos.map((p, index) => (
            <tr
              key={index}
              className="border-b border-green-600 hover:bg-green-800 transition-colors"
            >
              <td className="flex items-center justify-end pr-2 py-1 space-x-2">
                <span className="whitespace-nowrap">{p.local}</span>
                {p.escudo_local && (
                  <Image
                    src={p.escudo_local}
                    alt={p.local}
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                )}
              </td>
              <td className="py-1">{p.goles_local} - {p.goles_visitante}</td>
              <td className="flex items-center justify-start pl-2 py-1 space-x-2">
                {p.escudo_visitante && (
                  <Image
                    src={p.escudo_visitante}
                    alt={p.visitante}
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                )}
                <span className="whitespace-nowrap">{p.visitante}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
