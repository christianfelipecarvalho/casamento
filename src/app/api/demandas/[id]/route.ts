import { db } from "@/db";
import { demandas, historico } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const fieldLabels: Record<string, string> = {
  titulo: "Título",
  descricao: "Descrição",
  responsavel: "Responsável",
  categoria: "Categoria",
  status: "Status",
  prazo: "Prazo",
  valorEstimado: "Valor Estimado",
  fornecedor: "Fornecedor",
  observacoes: "Observações",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [demanda] = await db
    .select()
    .from(demandas)
    .where(eq(demandas.id, parseInt(id)));

  if (!demanda) {
    return NextResponse.json(
      { error: "Demanda não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(demanda);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const idNum = parseInt(id);

  const [demandaAtual] = await db
    .select()
    .from(demandas)
    .where(eq(demandas.id, idNum));

  if (!demandaAtual) {
    return NextResponse.json(
      { error: "Demanda não encontrada" },
      { status: 404 }
    );
  }

  const camposAlterados: {
    campo: string;
    valorAnterior: string | null;
    valorNovo: string | null;
  }[] = [];

  const camposParaVerificar = [
    "titulo",
    "descricao",
    "responsavel",
    "categoria",
    "status",
    "prazo",
    "valorEstimado",
    "fornecedor",
    "observacoes",
  ] as const;

  for (const campo of camposParaVerificar) {
    if (
      body[campo] !== undefined &&
      String(body[campo] ?? "") !==
        String((demandaAtual as Record<string, unknown>)[campo] ?? "")
    ) {
      camposAlterados.push({
        campo: fieldLabels[campo] || campo,
        valorAnterior: String(
          (demandaAtual as Record<string, unknown>)[campo] ?? ""
        ),
        valorNovo: String(body[campo] ?? ""),
      });
    }
  }

  const [demandaAtualizada] = await db
    .update(demandas)
    .set({
      ...body,
      atualizadoEm: new Date(),
      atualizadoPor: body.atualizadoPor,
    })
    .where(eq(demandas.id, idNum))
    .returning();

  if (camposAlterados.length > 0) {
    await db.insert(historico).values(
      camposAlterados.map((c) => ({
        demandaId: idNum,
        campo: c.campo,
        valorAnterior: c.valorAnterior,
        valorNovo: c.valorNovo,
        alteradoPor: body.atualizadoPor,
      }))
    );
  }

  return NextResponse.json(demandaAtualizada);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(demandas).where(eq(demandas.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
