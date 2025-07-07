import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";

type Partido = {
  local: string;
  goles_local: number;
  visitante: string;
  goles_visitante: number;
  escudo_local?: string;
  escudo_visitante?: string;
};

type Equipo = {
  nombre: string;
  escudo: string;
};

type AperturaData = {
  equipos: Equipo[];
  Apertura: {
    fechas: Record<string, Partido[]>;
  };
};

export async function GET() {
  const docRef = firestore.collection("primera_division").doc("2025");
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return NextResponse.json({}, { status: 404 });
  }

  const data = docSnap.data() as AperturaData;

  // Crear un mapa nombre -> escudo
  const mapaEquipos = Object.fromEntries(
    data.equipos.map((e) => [e.nombre, e.escudo])
  );

  // Enriquecer cada partido con los escudos
  const fechasConEscudos: Record<string, Partido[]> = {};

  for (const [num, partidos] of Object.entries(data.Apertura.fechas)) {
    fechasConEscudos[num] = partidos.map((p) => ({
      ...p,
      escudo_local: mapaEquipos[p.local],
      escudo_visitante: mapaEquipos[p.visitante],
    }));
  }

  return NextResponse.json(fechasConEscudos);
}
