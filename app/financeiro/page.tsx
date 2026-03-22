"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, ArrowUpRight, ArrowDownRight, Search, Filter, TrendingUp, Wallet, Plus, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { getStorageData, addStorageItem, deleteStorageItem } from "@/lib/storage"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useRealtime } from "@/hooks/useRealtime"
import { isConfigured } from "@/lib/supabase"

const mockTransacoes = [
  { id: "1", data: "2023-10-25", cliente: "João Silva", servico: "Habilitação", tipo: "Entrada", valor: 500, status: "Pago" },
  { id: "2", data: "2023-10-26", cliente: "Maria Oliveira", servico: "Renovação", tipo: "Entrada", valor: 350, status: "Pago" },
  { id: "3", data: "2023-10-27", cliente: "Pedro Santos", servico: "Adição de Categoria", tipo: "A Receber", valor: 800, status: "Pendente" },
  { id: "4", data: "2023-10-28", cliente: "Ana Costa", servico: "Mudança de Categoria", tipo: "Entrada", valor: 200, status: "Pago" },
  { id: "5", data: "2023-10-29", cliente: "Carlos Souza", servico: "Habilitação", tipo: "A Receber", valor: 1000, status: "Pendente" },
]

export default function FinanceiroPage() {
  const { data: realtimeTransacoes, loading: realtimeLoading } = useRealtime<any>("transacoes")
  const { data: realtimeServicos, loading: realtimeServicosLoading } = useRealtime<any>("servicos")
  const [localTransacoes, setLocalTransacoes] = useState<any[]>([])
  const [localServicos, setLocalServicos] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("todos")
  const [loading, setLoading] = useState(true)
  const [isLocalMode, setIsLocalMode] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTransacao, setSelectedTransacao] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [novoCliente, setNovoCliente] = useState("")
  const [novoServico, setNovoServico] = useState("")
  const [novoTipo, setNovoTipo] = useState("Entrada")
  const [novoValor, setNovoValor] = useState("")
  const [novoStatus, setNovoStatus] = useState("Pendente")

  const transacoes = isLocalMode ? localTransacoes : realtimeTransacoes
  const servicos = isLocalMode ? localServicos : realtimeServicos

  useEffect(() => {
    if (!isConfigured) {
      const localData = getStorageData("transacoes", mockTransacoes)
      localData.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())
      setLocalTransacoes(localData)
      
      const localServicosData = getStorageData("servicos", [])
      setLocalServicos(localServicosData)
      
      setIsLocalMode(true)
      setLoading(false)
    } else {
      setIsLocalMode(false)
      if (!realtimeLoading && !realtimeServicosLoading) {
        setLoading(false)
      }
    }
  }, [realtimeTransacoes, realtimeLoading, realtimeServicos, realtimeServicosLoading])

  const fetchTransacoes = async () => {
    if (!isConfigured) {
      const localData = getStorageData("transacoes", mockTransacoes)
      setLocalTransacoes(localData)
      const localServicosData = getStorageData("servicos", [])
      setLocalServicos(localServicosData)
    }
  }

  const handleSyncLocalData = async () => {
    setIsSyncing(true)
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        throw new Error("Supabase não configurado")
      }
      
      const localData = getStorageData("transacoes", [])
      if (localData.length === 0) {
        toast({ title: "Nada para sincronizar", description: "Não há dados locais para enviar." })
        return
      }

      const { supabase } = await import("@/lib/supabase")
      
      for (const transacao of localData) {
        const { id, ...transacaoData } = transacao
        await supabase.from("transacoes").upsert([transacaoData])
      }

      toast({ title: "Sincronização concluída", description: "Dados locais enviados para o Supabase." })
      fetchTransacoes()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro na sincronização", description: error.message })
    } finally {
      setIsSyncing(false)
    }
  }

  const filteredTransacoes = transacoes.filter(t => {
    let matchesSearch = true
    let matchesFilter = true

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      matchesSearch = (t.cliente_nome || t.cliente)?.toLowerCase().includes(query) || 
                     (t.servico_nome || t.servico)?.toLowerCase().includes(query)
    }

    if (filterType !== "todos") {
      const mappedType = filterType === "entrada" ? "Entrada" : "A Receber"
      matchesFilter = t.tipo === mappedType
    }

    return matchesSearch && matchesFilter
  })

  // Improved calculation logic:
  // totalReceber: Sum of actual remaining balances from the services table
  const totalReceberFromServicos = servicos.reduce((acc, curr) => acc + (parseFloat(curr.valor_receber || 0)), 0)
  
  // totalRecebido: Sum of all completed "Entrada" transactions
  const totalRecebido = transacoes
    .filter(t => t.tipo === "Entrada" && t.status === "Pago")
    .reduce((acc, curr) => acc + (parseFloat(curr.valor || 0)), 0)

  // Fallback for totalReceber if there are manual "A Receber" entries in transacoes (not linked to servicos)
  const manualAReceber = transacoes
    .filter(t => t.tipo === "A Receber" && !t.servico_id)
    .reduce((acc, curr) => acc + (parseFloat(curr.valor || 0)), 0)

  const totalReceber = totalReceberFromServicos + manualAReceber

  const handleAdicionarTransacao = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const valor = parseFloat(novoValor.replace(",", ".")) || 0
    if (!novoCliente || !novoServico || !valor) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "❌ Preencha todos os campos obrigatórios.",
      })
      return
    }

    const novaTransacao = {
      id: Math.random().toString(36).substr(2, 9),
      data: new Date().toISOString(),
      cliente_nome: novoCliente,
      servico_nome: novoServico,
      tipo: novoTipo,
      valor: valor,
      status: novoStatus
    }

    const updatedData = addStorageItem("transacoes", novaTransacao)
    
    // Sync with Supabase
    try {
      const { supabase } = await import("@/lib/supabase")
      await supabase.from("transacoes").insert([novaTransacao])
    } catch(err) {
      console.error(err)
    }

    if (isLocalMode) {
      setLocalTransacoes([novaTransacao, ...localTransacoes])
    }

    toast({
      title: "Sucesso",
      description: `✅ Transação adicionada com sucesso!`,
    })

    setIsModalOpen(false)
    setNovoCliente("")
    setNovoServico("")
    setNovoTipo("Entrada")
    setNovoValor("")
    setNovoStatus("Pendente")
    router.refresh()
  }

  const handleExcluirTransacao = async (id: string) => {
    deleteStorageItem("transacoes", id)
    
    try {
      const { supabase } = await import("@/lib/supabase")
      await supabase.from("transacoes").delete().eq("id", id)
    } catch(err) {
      console.error(err)
    }

    if (isLocalMode) {
      setLocalTransacoes(localTransacoes.filter(t => t.id !== id))
    }
    toast({
      title: "Sucesso",
      description: "✅ Transação excluída com sucesso!",
    })
    setIsDeleteModalOpen(false)
    setSelectedTransacao(null)
    router.refresh()
  }

  const confirmDelete = (transacao: any) => {
    setSelectedTransacao(transacao)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-3.5 sm:space-y-5 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Financeiro</h1>
          <p className="text-slate-500 mt-0.5 font-medium text-xs sm:text-sm">Acompanhe o fluxo de caixa e as pendências financeiras.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-orange-500 text-white font-semibold px-4 py-2.5 sm:px-6 sm:py-5 rounded-xl hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 shadow-sm">
              <Plus className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" /> <span className="text-xs sm:text-sm">Nova Transação</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] p-0 border border-slate-100 rounded-3xl overflow-hidden shadow-xl bg-white">
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 transition-transform duration-300">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Nova Transação</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium text-sm mt-1">
                    Registre uma nova entrada ou conta a receber.
                  </DialogDescription>
                </div>
              </div>
            </div>
            <form onSubmit={handleAdicionarTransacao} className="p-8 bg-white pb-8 relative text-slate-900">
              <div className="grid gap-4 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-semibold text-slate-700">Tipo</Label>
                    <Select value={novoTipo} onValueChange={setNovoTipo}>
                      <SelectTrigger className="rounded-xl h-12 border-slate-200 focus:ring-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Entrada">Entrada</SelectItem>
                        <SelectItem value="A Receber">A Receber</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold text-slate-700">Status</Label>
                    <Select value={novoStatus} onValueChange={setNovoStatus}>
                      <SelectTrigger className="rounded-xl h-12 border-slate-200 focus:ring-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-semibold text-slate-700">Cliente</Label>
                  <Input 
                    placeholder="Nome do cliente" 
                    className="rounded-xl h-12 border-slate-200 focus:ring-orange-500"
                    value={novoCliente}
                    onChange={(e) => setNovoCliente(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-semibold text-slate-700">Serviço</Label>
                  <Input 
                    placeholder="Tipo de serviço" 
                    className="rounded-xl h-12 border-slate-200 focus:ring-orange-500"
                    value={novoServico}
                    onChange={(e) => setNovoServico(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-semibold text-slate-700">Valor (R$)</Label>
                  <Input 
                    type="text"
                    placeholder="0,00" 
                    className="rounded-xl h-12 border-slate-200 focus:ring-orange-500"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button 
                  type="button" 
                  variant="dark"
                  className="rounded-xl h-12 flex-1 font-semibold transition-all shadow-sm" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 flex-[2] font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                >
                  Confirmar Adição
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLocalMode && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Modo de Armazenamento Local</h3>
              <p className="text-amber-700 text-xs">Os dados estão sendo salvos apenas neste navegador. Conecte o Supabase para sincronizar.</p>
            </div>
          </div>
          <Button 
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-10 px-6 shadow-sm transition-all"
            onClick={handleSyncLocalData}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Sincronizar Agora
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 md:gap-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bento-card relative overflow-hidden h-full border-slate-200 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 opacity-40 rounded-full blur-2xl group-hover:opacity-60 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10 p-4 sm:p-5">
                <CardTitle className="font-semibold text-slate-500 text-xs sm:text-sm">Total Recebido</CardTitle>
                <div className="bg-emerald-50 p-2 rounded-lg transition-transform duration-300 group-hover:scale-105">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 px-4 sm:px-5 pb-4 sm:pb-5">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">
                  R$ {totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-slate-500 text-xs font-medium">{transacoes.filter(t => t.tipo === "Entrada" && t.status === "Pago").length} transações pagas</p>
              </CardContent>
            </Card>
          </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bento-card relative overflow-hidden h-full border-slate-200 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 opacity-40 rounded-full blur-2xl group-hover:opacity-60 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10 p-4 sm:p-5">
                <CardTitle className="font-semibold text-slate-500 text-xs sm:text-sm">Total a Receber</CardTitle>
                <div className="bg-orange-50 p-2 rounded-lg transition-transform duration-300 group-hover:scale-105">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 px-4 sm:px-5 pb-4 sm:pb-5">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">
                  R$ {totalReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-slate-500 text-xs font-medium">{servicos.filter(s => parseFloat(s.valor_receber || 0) > 0).length + transacoes.filter(t => t.tipo === "A Receber" && !t.servico_id).length} pendências</p>
              </CardContent>
            </Card>
          </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 md:gap-3 justify-between items-stretch lg:items-center bg-card p-1.5 sm:p-3 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input 
            type="search" 
            placeholder="Pesquisar..." 
            className="pl-9 h-10 bg-slate-50 border-transparent focus:bg-white focus:border-orange-500 rounded-lg transition-all text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full lg:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[140px] md:w-[160px] h-10 rounded-lg bg-orange-50 border-orange-200 font-bold text-orange-600 hover:bg-orange-100 hover:border-orange-300 shadow-sm text-xs transition-all">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-orange-500" />
                <SelectValue placeholder="Tipo" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="receber">A Receber</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="mes_atual">
            <SelectTrigger className="w-full sm:w-[140px] md:w-[160px] h-10 rounded-lg border-slate-200 bg-white font-medium text-xs">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes_atual">Este Mês</SelectItem>
              <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
              <SelectItem value="ano">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden md:block bg-card rounded-2xl shadow-sm border border-border overflow-hidden transition-theme">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="font-black text-muted-foreground h-11 text-[11px] uppercase tracking-wider">Data</TableHead>
              <TableHead className="font-black text-muted-foreground h-11 text-[11px] uppercase tracking-wider">Cliente</TableHead>
              <TableHead className="font-black text-muted-foreground h-11 text-[11px] uppercase tracking-wider">Serviço</TableHead>
              <TableHead className="font-black text-muted-foreground h-11 text-[11px] uppercase tracking-wider">Tipo</TableHead>
              <TableHead className="text-right font-black text-muted-foreground h-11 text-[11px] uppercase tracking-wider">Valor</TableHead>
              <TableHead className="font-black text-muted-foreground h-11 text-[11px] uppercase tracking-wider">Status</TableHead>
              <TableHead className="w-[80px] font-black text-muted-foreground h-11 text-[11px] uppercase tracking-wider text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-48 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 ml-auto rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-10 rounded-xl" /></TableCell>
                </TableRow>
              ))
            ) : filteredTransacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-slate-400 font-medium">
                  Nenhuma transação registrada no período.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransacoes.map((transacao, index) => (
                <motion.tr 
                  key={transacao.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-orange-50/30 transition-colors border-b last:border-0"
                  >
                    <TableCell className="text-slate-500 py-3.5 text-xs font-medium">
                      {new Date(transacao.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 py-3.5 text-sm">{transacao.cliente_nome || transacao.cliente}</TableCell>
                    <TableCell className="text-slate-800 py-3.5 font-bold text-xs">{transacao.servico_nome || transacao.servico}</TableCell>
                    <TableCell className="py-3.5">
                      {(() => {
                        // Find if this transaction is linked to a service
                        const matchedServico = servicos.find(s => 
                          (s.id === transacao.servico_id) || 
                          (s.cliente_nome === (transacao.cliente_nome || transacao.cliente) && s.tipo_servico === (transacao.servico_nome || transacao.servico))
                        );
                        
                        const displayValor = (transacao.tipo === "A Receber" && matchedServico) 
                          ? matchedServico.valor_receber 
                          : transacao.valor;
                        
                        return (
                          <>
                            <span className={cn(
                              "inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider",
                              transacao.tipo === "Entrada" ? 'text-emerald-700' : 'text-orange-700'
                            )}>
                              {transacao.tipo === "Entrada" ? (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDownRight className="h-3.5 w-3.5" />
                              )}
                              {transacao.tipo}
                            </span>
                          </>
                        );
                      })()}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-black py-3.5 text-lg",
                      transacao.tipo === "Entrada" ? 'text-emerald-800' : 'text-orange-900'
                    )}>
                      {(() => {
                        const matchedServico = servicos.find(s => 
                          (s.id === transacao.servico_id) || 
                          (s.cliente_nome === (transacao.cliente_nome || transacao.cliente) && s.tipo_servico === (transacao.servico_nome || transacao.servico))
                        );
                        
                        const displayValor = (transacao.tipo === "A Receber" && matchedServico) 
                          ? parseFloat(matchedServico.valor_receber || 0)
                          : parseFloat(transacao.valor || 0);

                        return `R$ ${displayValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
                      })()}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      transacao.status === "Pago" ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                    )}>
                      {transacao.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all font-bold"
                      onClick={() => confirmDelete(transacao)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200/60">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ))
        ) : filteredTransacoes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200/60 text-center">
            <p className="text-slate-400 font-medium">Nenhuma transação registrada no período.</p>
          </div>
        ) : (
          filteredTransacoes.map((transacao, index) => (
            <motion.div
              key={transacao.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-3 sm:p-4 border border-border shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{transacao.cliente_nome || transacao.cliente}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-600 font-bold">{transacao.servico_nome || transacao.servico}</p>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                  transacao.tipo === "Entrada" ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                )}>
                  {transacao.tipo === "Entrada" ? (
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  ) : (
                    <ArrowDownRight className="w-2.5 h-2.5" />
                  )}
                  {transacao.tipo}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                  {new Date(transacao.data).toLocaleDateString("pt-BR")}
                </div>
                <div className={cn(
                  "text-lg sm:text-xl font-black tracking-tight",
                  transacao.tipo === "Entrada" ? 'text-emerald-700' : 'text-orange-800'
                )}>
                  {(() => {
                        const matchedServico = servicos.find(s => 
                          (s.id === transacao.servico_id) || 
                          (s.cliente_nome === (transacao.cliente_nome || transacao.cliente) && s.tipo_servico === (transacao.servico_nome || transacao.servico))
                        );
                        
                        const displayValor = (transacao.tipo === "A Receber" && matchedServico) 
                          ? parseFloat(matchedServico.valor_receber || 0)
                          : parseFloat(transacao.valor || 0);

                        return `R$ ${displayValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
                      })()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                  transacao.status === "Pago" ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                )}>
                  {transacao.status}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-red-500" onClick={() => confirmDelete(transacao)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-slate-500 py-2">
              Deseja realmente excluir esta transação de <strong>R$ {selectedTransacao?.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> ({selectedTransacao?.cliente})?
              <br /><br />
              <span className="text-red-500 text-xs font-bold uppercase tracking-wider">⚠️ Esta ação removerá o registro permanentemente do fluxo de caixa.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="dark" className="rounded-xl font-bold flex-1 shadow-sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="rounded-xl font-bold flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleExcluirTransacao(selectedTransacao?.id)}>
              Excluir Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
