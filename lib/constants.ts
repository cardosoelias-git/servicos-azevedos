export const TIPOS_SERVICO = [
  "Habilitação",
  "Renovação",
  "Adição de Categoria",
  "Mudança de Categoria"
] as const;

export type TipoServico = typeof TIPOS_SERVICO[number];

export const ETAPAS_POR_TIPO: Record<TipoServico, string[]> = {
  "Habilitação": [
    "Aula Teórica", "Certificado", "Laudo", "Digitalização", "Médicos", "Prova de Legislação", "Aula Prática", "Prova Prática", "Gráfica"
  ],
  "Renovação": [
    "Laudo", "Digitalização", "Médicos", "Gráfica"
  ],
  "Adição de Categoria": [
    "Laudo", "Digitalização", "Aula Teórica", "Certificado", "Prova de Legislação", "Aula Prática", "Prova Prática"
  ],
  "Mudança de Categoria": [
    "Toxicológico", "Laudo", "Médicos", "Aula Teórica", "Certificado", "Prova de Legislação", "Aula Prática", "Prova Prática"
  ]
};

export const STATUS_SERVICO = [
  "Em Andamento",
  "Concluído",
  "Pendente",
  "Cancelado",
  "Atrasado"
] as const;

export type StatusServico = typeof STATUS_SERVICO[number];

export const STATUS_FINANCEIRO = [
  "Pago",
  "Pendente",
  "Atrasado"
] as const;

export type StatusFinanceiro = typeof STATUS_FINANCEIRO[number];
