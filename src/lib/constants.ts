export const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" },
  { value: "em_andamento", label: "Em andamento", color: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  { value: "ok", label: "OK", color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  { value: "cancelado", label: "Cancelado", color: "bg-red-100 text-red-800", dot: "bg-red-500" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "local", label: "Local", icon: "📍" },
  { value: "buffet", label: "Buffet", icon: "🍽️" },
  { value: "decoracao", label: "Decoração", icon: "🌸" },
  { value: "musica", label: "Música", icon: "🎵" },
  { value: "vestimenta", label: "Vestimenta", icon: "👗" },
  { value: "convites", label: "Convites", icon: "💌" },
  { value: "fotografia", label: "Fotografia", icon: "📸" },
  { value: "cerimonial", label: "Cerimonial", icon: "💒" },
  { value: "transporte", label: "Transporte", icon: "🚗" },
  { value: "lua_de_mel", label: "Lua de Mel", icon: "✈️" },
  { value: "documentacao", label: "Documentação", icon: "📄" },
  { value: "outros", label: "Outros", icon: "📋" },
] as const;

export type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];
export type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];

export function getStatusInfo(value: string) {
  return STATUS_OPTIONS.find((s) => s.value === value) || STATUS_OPTIONS[0];
}

export function getCategoryInfo(value: string) {
  return CATEGORY_OPTIONS.find((c) => c.value === value) || CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1];
}
