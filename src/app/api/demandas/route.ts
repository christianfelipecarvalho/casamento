import { db } from "@/db";
import { demandas, historico } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db
    .select()
    .from(demandas)
    .orderBy(desc(demandas.atualizadoEm));
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();

  const [novaDemanda] = await db
    .insert(demandas)
    .values({
      titulo: body.titulo,
      descricao: body.descricao || null,
      responsavel: body.responsavel,
      categoria: body.categoria || "outros",
      status: body.status || "pendente",
      prazo: body.prazo || null,
      valorEstimado: body.valorEstimado || null,
      fornecedor: body.fornecedor || null,
      observacoes: body.observacoes || null,
      atualizadoPor: body.atualizadoPor,
    })
    .returning();

  await db.insert(historico).values({
    demandaId: novaDemanda.id,
    campo: "criação",
    valorAnterior: null,
    valorNovo: "Demanda criada",
    alteradoPor: body.atualizadoPor,
  });

  return NextResponse.json(novaDemanda, { status: 201 });
}
