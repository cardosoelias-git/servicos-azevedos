"use client"

import { TrendingUp, DollarSign } from "lucide-react"

interface Props {
  veiculos: any[]
}

export default function ContaRelatorios({ veiculos }: Props) {
  const totalVeiculos = veiculos.length
  const totalServicos = veiculos.reduce((acc, v) => acc + (v.servicos?.length || 0), 0)
  const servicosPendentes = veiculos.reduce((acc, v) => acc + (v.servicos?.filter((s: any) => s.status === "Pendente").length || 0), 0)
  const servicosConcluidos = veiculos.reduce((acc, v) => acc + (v.servicos?.filter((s: any) => s.status === "Concluído").length || 0), 0)
  const valorTotalServicos = veiculos.reduce((acc, v) => acc + (v.servicos?.reduce((a: number, s: any) => a + (s.valor || 0), 0) || 0), 0)

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-white" /></div>
          <p className="font-bold text-blue-800">Resumo Geral</p>
        </div>
        <div className="space-y-2">
          {[
            { label: "Total de Veículos", value: totalVeiculos },
            { label: "Total de Habilitações", value: totalServicos },
            { label: "Pendentes", value: servicosPendentes },
            { label: "Concluídos", value: servicosConcluidos },
          ].map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="text-sm text-blue-700">{item.label}</span>
              <span className="font-bold text-blue-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-white" /></div>
          <p className="font-bold text-emerald-800">Financeiro</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between"><span className="text-sm text-emerald-700">Valor Total</span><span className="font-bold text-emerald-900">R$ {valorTotalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between"><span className="text-sm text-emerald-700">Ticket Médio</span><span className="font-bold text-emerald-900">R$ {totalServicos > 0 ? (valorTotalServicos / totalServicos).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "0,00"}</span></div>
        </div>
      </div>
    </div>
  )
}
