"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2, Circle, Save, DollarSign, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getStorageData, updateStorageItem, addStorageItem } from "@/lib/storage"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

const etapasPorTipo: Record<string, string[]> = {
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
}

export default function ServicoDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [servicoNaoEncontrado, setServicoNaoEncontrado] = useState(false)
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false)
  const [valorPagamento, setValorPagamento] = useState("")
  
  const [servico, setServico] = useState<any>({
    id: "",
    cliente_nome: "",
    tipo_servico: "",
    valor_total: 0,
    valor_pago: 0,
    valor_receber: 0,
    etapas_completas: 0,
    total_etapas: 0,
    status: "Em Andamento"
  })

  const [etapas, setEtapas] = useState<any[]>([])

  useEffect(() => {
    const id = params.id as string
    const servicos = getStorageData("servicos", [])
    const servicoData = servicos.find((s: any) => s.id === id)
    
    if (!servicoData) {
      setServicoNaoEncontrado(true)
      setLoading(false)
      return
    }

    setServico(servicoData)
    
    const etapasSalvas = servicoData.etapas || []
    const tipo = servicoData.tipo_servico as keyof typeof etapasPorTipo
    const nomesEtapas = etapasPorTipo[tipo] || etapasPorTipo["Habilitação"]
    
    const etapasFormatadas = nomesEtapas.map((nome, index) => {
      const etapaSalva = etapasSalvas[index]
      return {
        id: index.toString(),
        nome_etapa: nome,
        concluido: etapaSalva?.concluido || false,
        valor_pago_etapa: etapaSalva?.valor_pago_etapa || 0,
        status_etapa: etapaSalva?.status_etapa || "Pendente"
      }
    })
    
    setEtapas(etapasFormatadas)
    setLoading(false)
  }, [params.id])

  const handleUpdateEtapa = (index: number, field: string, value: any) => {
    const newEtapas = [...etapas]
    newEtapas[index] = { ...newEtapas[index], [field]: value }
    setEtapas(newEtapas)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const etapasConcluidas = etapas.filter(e => e.concluido).length
      const valorPagoCalculado = etapas.reduce((acc, e) => acc + (e.valor_pago_etapa || 0), 0)
      const novoStatus = etapasConcluidas === etapas.length ? "Concluído" : "Em Andamento"
      
      const updatedServico = {
        ...servico,
        etapas,
        etapas_completas: etapasConcluidas,
        total_etapas: etapas.length,
        valor_pago: valorPagoCalculado,
        valor_receber: servico.valor_total - valorPagoCalculado,
        status: novoStatus
      }
      
      updateStorageItem("servicos", servico.id, updatedServico)
      setServico(updatedServico)
      
      toast({
        title: "Sucesso",
        description: "✅ Etapas atualizadas com sucesso!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "❌ Erro ao atualizar etapa. Tente novamente.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRegistrarPagamento = async () => {
    const valor = parseFloat(valorPagamento.replace(",", ".")) || 0
    if (valor <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "❌ Informe um valor válido.",
      })
      return
    }

    const novoValorPago = servico.valor_pago + valor
    const novoValorReceber = servico.valor_total - novoValorPago
    
    const updatedServico = {
      ...servico,
      valor_pago: novoValorPago,
      valor_receber: Math.max(0, novoValorReceber)
    }
    
    updateStorageItem("servicos", servico.id, updatedServico)
    
    addStorageItem("transacoes", {
      id: Math.random().toString(36).substr(2, 9),
      data: new Date().toISOString(),
      cliente: servico.cliente_nome,
      servico: servico.tipo_servico,
      tipo: "Entrada",
      valor: valor,
      status: "Pago"
    })
    
    setServico(updatedServico)
    setIsPagamentoModalOpen(false)
    setValorPagamento("")
    
    toast({
      title: "Sucesso",
      description: `✅ Pagamento de R$ ${valor.toFixed(2).replace(".", ",")} registrado!`,
    })
  }

  const handleConcluirServico = async () => {
    const updatedServico = {
      ...servico,
      status: "Concluído",
      etapas_completas: etapas.length,
      valor_pago: servico.valor_total,
      valor_receber: 0
    }
    
    updateStorageItem("servicos", servico.id, updatedServico)
    setServico(updatedServico)
    
    toast({
      title: "Sucesso",
      description: "✅ Serviço concluído com sucesso!",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Carregando detalhes do serviço...</p>
        </div>
      </div>
    )
  }

  if (servicoNaoEncontrado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Serviço não encontrado</h2>
        <p className="text-slate-500">O serviço solicitado não existe ou foi removido.</p>
        <Button onClick={() => router.push("/servicos")} className="bg-gradient-to-r from-orange-500 to-orange-600 font-bold rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Serviços
        </Button>
      </div>
    )
  }

  const etapasConcluidas = etapas.filter(e => e.concluido).length
  const progresso = Math.round((etapasConcluidas / etapas.length) * 100)

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-orange-50 hover:text-orange-500 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">Detalhes do Serviço</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm sm:text-base truncate">{servico.cliente_nome} - {servico.tipo_servico}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Dialog open={isPagamentoModalOpen} onOpenChange={setIsPagamentoModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none h-10 sm:h-11 rounded-xl font-bold text-xs sm:text-sm border-orange-200 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600">
                <DollarSign className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">Registrar Pagamento</DialogTitle>
                <DialogDescription>
                  Adicione um novo pagamento para este serviço.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="font-semibold">Valor (R$)</Label>
                  <Input
                    type="text"
                    placeholder="0,00"
                    className="mt-1 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                  />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Valor Total:</span>
                    <span className="font-bold">R$ {servico.valor_total.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Já Pago:</span>
                    <span className="font-bold">R$ {servico.valor_pago.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-orange-500">
                    <span>Falta:</span>
                    <span className="font-bold">R$ {servico.valor_receber.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setIsPagamentoModalOpen(false)} className="rounded-xl">
                  Cancelar
                </Button>
                <Button onClick={handleRegistrarPagamento} className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold">
                  Confirmar Pagamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {servico.status !== "Concluído" && (
            <Button onClick={handleConcluirServico} variant="outline" className="flex-1 sm:flex-none h-10 sm:h-11 rounded-xl font-bold text-xs sm:text-sm text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              <CheckCircle2 className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> Concluir
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold h-10 sm:h-11 px-3 sm:px-6 text-xs sm:text-sm">
            {saving ? "Salvando..." : <><Save className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> <span className="hidden sm:inline">Salvar</span><span className="sm:hidden">Salvar</span></>}
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-black text-orange-800 uppercase tracking-wider">Progresso do Serviço</span>
            <span className="text-base sm:text-lg font-black text-orange-600">{progresso}%</span>
          </div>
          <div className="h-3 sm:h-4 w-full bg-orange-200/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-xs text-orange-600 mt-2 font-medium">{etapasConcluidas} de {etapas.length} etapas concluídas</p>
        </div>
        <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shrink-0 ${
          servico.status === "Concluído" ? "bg-emerald-100 text-emerald-700" :
          servico.status === "Cancelado" ? "bg-red-100 text-red-700" :
          "bg-orange-100 text-orange-700"
        }`}>
          {servico.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="bento-card lg:col-span-1">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-5">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Valor Total</p>
              <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">R$ {servico.valor_total.toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg sm:rounded-xl border border-emerald-100">
              <p className="text-xs sm:text-sm text-emerald-600 font-medium">Valor Pago</p>
              <p className="text-lg sm:text-2xl font-black text-emerald-600">R$ {servico.valor_pago.toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-500/10 rounded-lg sm:rounded-xl border border-orange-100">
              <p className="text-xs sm:text-sm text-orange-600 font-medium">A Receber</p>
              <p className="text-xl sm:text-3xl font-black text-orange-600">R$ {servico.valor_receber.toFixed(2).replace(".", ",")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card lg:col-span-2">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Progresso das Etapas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1">
              {etapas.map((etapa, index) => (
                <motion.div 
                  key={etapa.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-start gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl border-2 transition-all duration-300",
                    etapa.concluido 
                      ? "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 hover:border-emerald-300" 
                      : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 hover:border-orange-200 hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 text-sm sm:text-base font-bold",
                    etapa.concluido 
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                      <h3 className={cn(
                        "font-bold text-base sm:text-lg transition-all truncate",
                        etapa.concluido ? "text-emerald-700" : "text-slate-900 dark:text-white"
                      )}>{etapa.nome_etapa}</h3>
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                        <Checkbox 
                          id={`concluido-${index}`} 
                          checked={etapa.concluido}
                          onCheckedChange={(checked) => handleUpdateEtapa(index, "concluido", checked)}
                          className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 h-4 w-4"
                        />
                        <Label htmlFor={`concluido-${index}`} className="text-xs font-semibold cursor-pointer whitespace-nowrap">Concluído</Label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Pago (R$)</Label>
                        <Input 
                          type="number" 
                          className="h-9 sm:h-10 text-xs sm:text-sm font-medium rounded-lg border-slate-200 dark:border-slate-700 focus:ring-orange-500" 
                          value={etapa.valor_pago_etapa}
                          onChange={(e) => handleUpdateEtapa(index, "valor_pago_etapa", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</Label>
                        <Select 
                          value={etapa.status_etapa} 
                          onValueChange={(val) => handleUpdateEtapa(index, "status_etapa", val)}
                        >
                          <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm font-medium rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            <SelectItem value="Pendente">Pendente</SelectItem>
                            <SelectItem value="Apto">Apto</SelectItem>
                            <SelectItem value="Inapto">Inapto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {etapa.concluido && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                      <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
