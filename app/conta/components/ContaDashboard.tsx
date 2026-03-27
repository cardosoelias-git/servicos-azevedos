"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { Car, IdCard, Clock, DollarSign, Plus } from "lucide-react"

interface Props {
  veiculos: any[]
  onNewVeiculo: () => void
}

export default function ContaDashboard({ veiculos, onNewVeiculo }: Props) {
  const totalVeiculos = veiculos.length
  const totalServicos = veiculos.reduce((acc, v) => acc + (v.servicos?.length || 0), 0)
  const servicosPendentes = veiculos.reduce((acc, v) => acc + (v.servicos?.filter((s: any) => s.status === "Pendente").length || 0), 0)
  const valorTotalServicos = veiculos.reduce((acc, v) => acc + (v.servicos?.reduce((a: number, s: any) => a + (s.valor || 0), 0) || 0), 0)

  const stats = [
    { label: "Veículos", value: totalVeiculos, icon: Car, color: "blue" },
    { label: "Habilitação", value: totalServicos, icon: IdCard, color: "purple" },
    { label: "Pendentes", value: servicosPendentes, icon: Clock, color: "orange" },
    { label: "Total", value: `R$ ${valorTotalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: DollarSign, color: "emerald" },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-2xl border-0 shadow-lg bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100`}>
            <div className={`w-10 h-10 bg-${stat.color}-500 rounded-xl flex items-center justify-center mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-xs font-bold text-${stat.color}-600 uppercase tracking-wider`}>{stat.label}</p>
            <p className={`text-xl sm:text-2xl font-black text-${stat.color}-700`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>
      <Button onClick={onNewVeiculo}
        className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl font-bold shadow-lg shadow-orange-500/25">
        <Plus className="w-5 h-5 mr-2" /> Novo Veículo
      </Button>
    </div>
  )
}
