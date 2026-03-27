"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Car, Plus, Trash2, Edit2, BadgeCheck, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
  veiculos: any[]
  isLocalMode: boolean
  isSyncing: boolean
  onNewVeiculo: () => void
  onEditVeiculo: (index: number) => void
  onDeleteVeiculo: (id: string) => void
  onOpenServico: (index: number) => void
  onDeleteServico: (veiculoIndex: number, servicoId: string) => void
  onSync: () => void
}

const ITEMS_PER_PAGE = 5

export default function ContaVeiculos({
  veiculos, isLocalMode, isSyncing,
  onNewVeiculo, onEditVeiculo, onDeleteVeiculo,
  onOpenServico, onDeleteServico, onSync
}: Props) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(veiculos.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedVeiculos = veiculos.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Frota Azevedo</h3>
          <p className="text-slate-500 text-sm font-medium">
            {veiculos.length} veículo{veiculos.length !== 1 ? "s" : ""} cadastrado{veiculos.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isLocalMode && (
          <Button variant="ghost" size="sm"
            className="bg-amber-50 text-amber-600 hover:bg-amber-100"
            onClick={onSync} disabled={isSyncing}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
            Sincronizar
          </Button>
        )}
      </div>
      <Button onClick={onNewVeiculo}
        className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl font-bold shadow-lg shadow-orange-500/25">
        <Plus className="w-5 h-5 mr-2" /> Cadastrar Veículo
      </Button>
      {veiculos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Car className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">Nenhum veículo cadastrado</p>
        </div>
      ) : (
        <>
          {paginatedVeiculos.map((veiculo, pageIndex) => {
            const globalIndex = startIndex + pageIndex
            return (
              <motion.div key={veiculo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                      <Car className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{veiculo.cliente_nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded-md">{veiculo.placa}</span>
                        <span className="text-xs text-slate-500">{veiculo.modelo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onOpenServico(globalIndex)} className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50">
                      <BadgeCheck className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEditVeiculo(globalIndex)} className="h-9 w-9 rounded-xl text-blue-600 hover:bg-blue-50">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteVeiculo(veiculo.id)} className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {veiculo.servicos?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Habilitação ({veiculo.servicos.length})</p>
                    <div className="space-y-1.5">
                      {veiculo.servicos.map((servico: any) => (
                        <div key={servico.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", servico.status === "Concluído" ? "bg-emerald-500" : "bg-orange-400")} />
                            <span className="text-xs font-semibold text-slate-700">{servico.nome}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-600">R$ {(servico.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <button onClick={() => onDeleteServico(globalIndex, servico.id)} className="text-red-400 hover:text-red-600 p-0.5">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
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
