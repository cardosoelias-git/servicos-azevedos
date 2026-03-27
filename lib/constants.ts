export const TIPOS_SERVICO = [
  "Transferência",
  "Emplacamento",
  "Licenciamento",
  "Registro e Documentação",
  "Consultas Gerais"
] as const;

export type TipoServico = typeof TIPOS_SERVICO[number];

export const ETAPAS_POR_TIPO: Record<TipoServico, string[]> = {
  "Transferência": [
    "Vistoria", "Digitalização", "Taxas", "Emissão CRV/CRLV"
  ],
  "Emplacamento": [
    "Vistoria", "Confecção de Placas", "Instalação", "Atualização Sistema"
  ],
  "Licenciamento": [
    "Consulta de Débitos", "Pagamento de Taxas", "Emissão CRLV-e"
  ],
  "Registro e Documentação": [
    "Análise de Documentos", "Entrada no Sistema", "Acompanhamento", "Conclusão"
  ],
  "Consultas Gerais": [
    "Pesquisa de CNH", "Histórico de Habilitação", "Levantamento de Multas"
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
