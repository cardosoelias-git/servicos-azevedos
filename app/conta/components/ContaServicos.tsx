"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, Wrench, UserPlus, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { HABILITACAO_SERVICOS } from "@/lib/conta-constants"

interface Props {
  clientes: any[]
  onNewCliente: () => void
  onEditCliente: (index: number) => void
  onToggleServicoStatus: (clienteId: string, servicoId: string) => void
}

const ITEMS_PER_PAGE = 5

export default function ContaServicos({ clientes, onNewCliente, onEditCliente, onToggleServicoStatus }: Props) {
  const [currentPage, setCurrentPage] = useState(1)

  const clientesComServicos = clientes.filter(c => c.servicos?.length > 0)
  const totalPages = Math.ceil(clientesComServicos.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedClientes = clientesComServicos.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Habilitação</h3>
          <p className="text-slate-500 text-sm font-medium">
            {clientesComServicos.length} cliente{clientesComServicos.length !== 1 ? "s" : ""} com habilitação
          </p>
        </div>
      </div>
      <Button onClick={onNewCliente}
        className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl font-bold shadow-lg shadow-orange-500/25">
        <UserPlus className="w-5 h-5 mr-2" /> Cadastrar Cliente
      </Button>
      {clientesComServicos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">Nenhum cliente com habilitação</p>
        </div>
      ) : (
        <>
          {paginatedClientes.map((cliente) => {
            const originalIndex = clientes.findIndex(c => c.id === cliente.id)
            return (
              <div key={cliente.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {cliente.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{cliente.nome}</p>
                    <p className="text-xs text-slate-500">{cliente.cpf || cliente.telefone || "—"}</p>
                  </div>
                  <button onClick={() => onEditCliente(originalIndex)}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-orange-500">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {cliente.servicos?.map((servicoId: string) => {
                    const servicoInfo = HABILITACAO_SERVICOS.find(s => s.id === servicoId)
                    const status = cliente.servicos_status?.[servicoId] || "Pendente"
                    const concluido = status === "Concluído"
                    return (
                      <div key={servicoId} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", concluido ? "bg-emerald-500" : "bg-orange-400")} />
                          <span className="text-xs font-semibold text-slate-700">{servicoInfo?.nome || servicoId}</span>
                        </div>
                        <button onClick={() => onToggleServicoStatus(cliente.id, servicoId)}
                          className={cn(
                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full transition-all",
                            concluido
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                          )}>
                          {status}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl h-9 px-3">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button key={page} variant="ghost" size="sm" onClick={() => goToPage(page)}
                  className={cn(
                    "rounded-xl h-9 w-9 font-bold text-sm",
                    currentPage === page ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-500 hover:bg-slate-100"
                  )}>
                  {page}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-xl h-9 px-3">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
