import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", [
  "pendente",
  "em_andamento",
  "ok",
  "cancelado",
]);

export const categoryEnum = pgEnum("category", [
  "local",
  "buffet",
  "decoracao",
  "musica",
  "vestimenta",
  "convites",
  "fotografia",
  "cerimonial",
  "transporte",
  "lua_de_mel",
  "documentacao",
  "outros",
]);

export const demandas = pgTable("demandas", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  responsavel: text("responsavel").notNull(),
  categoria: categoryEnum("categoria").notNull().default("outros"),
  status: statusEnum("status").notNull().default("pendente"),
  prazo: text("prazo"),
  valorEstimado: text("valor_estimado"),
  fornecedor: text("fornecedor"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
  atualizadoPor: text("atualizado_por").notNull(),
});

export const historico = pgTable("historico", {
  id: serial("id").primaryKey(),
  demandaId: integer("demanda_id")
    .references(() => demandas.id, { onDelete: "cascade" })
    .notNull(),
  campo: text("campo").notNull(),
  valorAnterior: text("valor_anterior"),
  valorNovo: text("valor_novo"),
  alteradoPor: text("alterado_por").notNull(),
  alteradoEm: timestamp("alterado_em").defaultNow().notNull(),
});
