"use client"

import { Shield, Database, AlertCircle } from "lucide-react"
import { ADMIN_CREDENTIALS } from "@/lib/conta-constants"

interface Props {
  veiculos: any[]
  onClearData: () => void
}

export default function ContaConfig({ veiculos, onClearData }: Props) {
  const totalVeiculos = veiculos.length
  const totalServicos = veiculos.reduce((acc, v) => acc + (v.servicos?.length || 0), 0)

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-3"><Shield className="w-5 h-5 text-slate-600" /><p className="font-bold text-slate-800">Segurança</p></div>
        <p className="text-sm text-slate-500">Email: {ADMIN_CREDENTIALS.email}</p>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-3"><Database className="w-5 h-5 text-slate-600" /><p className="font-bold text-slate-800">Dados</p></div>
        <p className="text-sm text-slate-500">Veículos: {totalVeiculos} | Habilitações: {totalServicos}</p>
      </div>
      <button onClick={onClearData}
        className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-left">
        <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><p className="font-bold text-red-800">Limpar Dados</p></div>
      </button>
    </div>
  )
}
