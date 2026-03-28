import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { demandas } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("Seeding database...");

  await db.insert(demandas).values([
    {
      titulo: "Local da Cerimônia e Festa",
      descricao: "Definir e contratar o local para cerimônia e recepção",
      responsavel: "Christian",
      categoria: "local",
      status: "pendente",
      atualizadoPor: "Christian",
    },
    {
      titulo: "Buffet",
      descricao: "Pesquisar e contratar serviço de buffet para a festa",
      responsavel: "Christian",
      categoria: "buffet",
      status: "pendente",
      atualizadoPor: "Christian",
    },
    {
      titulo: "Decoração",
      descricao: "Definir tema, flores e decoração do evento",
      responsavel: "Paula",
      categoria: "decoracao",
      status: "pendente",
      atualizadoPor: "Christian",
    },
    {
      titulo: "Fotografia e Vídeo",
      descricao: "Contratar fotógrafo e videomaker para o evento",
      responsavel: "Paula",
      categoria: "fotografia",
      status: "pendente",
      atualizadoPor: "Christian",
    },
    {
      titulo: "Música e DJ",
      descricao: "Definir banda/DJ para cerimônia e festa",
      responsavel: "Christian",
      categoria: "musica",
      status: "pendente",
      atualizadoPor: "Christian",
    },
    {
      titulo: "Convites",
      descricao: "Criar design, imprimir e enviar convites",
      responsavel: "Paula",
      categoria: "convites",
      status: "pendente",
      atualizadoPor: "Christian",
    },
    {
      titulo: "Vestido da Noiva",
      descricao: "Escolher e comprar/alugar vestido de noiva",
      responsavel: "Paula",
      categoria: "vestimenta",
      status: "pendente",
      atualizadoPor: "Christian",
    },
    {
      titulo: "Traje do Noivo",
      descricao: "Escolher e comprar/alugar traje do noivo",
      responsavel: "Christian",
      categoria: "vestimenta",
      status: "pendente",
      atualizadoPor: "Christian",
    },
    {
      titulo: "Cerimonialista",
      descricao: "Contratar cerimonialista para organização geral",
      responsavel: "Christian",
      categoria: "cerimonial",
      status: "pendente",
      atualizadoPor: "Christian",
    },
    {
      titulo: "Documentação Civil",
      descricao: "Providenciar documentos para casamento civil",
      responsavel: "Christian",
      categoria: "documentacao",
      status: "pendente",
      atualizadoPor: "Christian",
    },
    {
      titulo: "Lua de Mel",
      descricao: "Planejar destino e reservar viagem de lua de mel",
      responsavel: "Christian",
      categoria: "lua_de_mel",
      status: "pendente",
      atualizadoPor: "Christian",
    },
  ]);

  console.log("Seed completed!");
}

seed().catch(console.error);
