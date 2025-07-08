import { NextRequest, NextResponse } from "next/server";
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

type DocumentoPrimeraDivision = {
  equipos?: Equipo[]; // puede faltar en reserva
  [torneo: string]: { fechas: Record<string, Partido[]> } | Equipo[] | undefined;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const division = searchParams.get("division") || "primera_division";
  const año = searchParams.get("año") || "2025";
  const torneo = searchParams.get("torneo") || "Apertura";

  const docRef = firestore.collection(division).doc(año);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return NextResponse.json({}, { status: 404 });
  }

  const data = docSnap.data() as DocumentoPrimeraDivision;
  const torneoData = data[torneo] as { fechas: Record<string, Partido[]> };

  if (!torneoData) {
    return NextResponse.json({}, { status: 404 });
  }

  // si la división no tiene equipos propios (ej: reserva), traer de primera_division
  let equipos = data.equipos;

  if (!equipos && division === "reserva") {
    const primeraDoc = await firestore.collection("primera_division").doc(año).get();
    if (primeraDoc.exists) {
      const primeraData = primeraDoc.data() as DocumentoPrimeraDivision;
      equipos = primeraData.equipos;
    }
  }

  if (!equipos) {
    return NextResponse.json({}, { status: 404 });
  }

  // Crear un mapa nombre -> escudo
  const mapaEquipos = Object.fromEntries(
    equipos.map((e) => [e.nombre, e.escudo])
  );

  // Enriquecer cada partido con los escudos
  const fechasConEscudos: Record<string, Partido[]> = {};

  for (const [num, partidos] of Object.entries(torneoData.fechas)) {
    fechasConEscudos[num] = (partidos as Partido[]).map((p) => ({
      ...p,
      escudo_local: mapaEquipos[p.local],
      escudo_visitante: mapaEquipos[p.visitante],
    }));
  }

  return NextResponse.json(fechasConEscudos);
}
