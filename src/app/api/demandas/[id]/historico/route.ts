import { db } from "@/db";
import { historico } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await db
    .select()
    .from(historico)
    .where(eq(historico.demandaId, parseInt(id)))
    .orderBy(desc(historico.alteradoEm));

  return NextResponse.json(result);
}
