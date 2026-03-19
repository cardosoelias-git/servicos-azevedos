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
import { DollarSign, ArrowUpRight, ArrowDownRight, Search, Filter, TrendingUp, Wallet, Plus, Trash2 } from "lucide-react"
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

const mockTransacoes = [
  { id: "1", data: "2023-10-25", cliente: "João Silva", servico: "Habilitação", tipo: "Entrada", valor: 500, status: "Pago" },
  { id: "2", data: "2023-10-26", cliente: "Maria Oliveira", servico: "Renovação", tipo: "Entrada", valor: 350, status: "Pago" },
  { id: "3", data: "2023-10-27", cliente: "Pedro Santos", servico: "Adição de Categoria", tipo: "A Receber", valor: 800, status: "Pendente" },
  { id: "4", data: "2023-10-28", cliente: "Ana Costa", servico: "Mudança de Categoria", tipo: "Entrada", valor: 200, status: "Pago" },
  { id: "5", data: "2023-10-29", cliente: "Carlos Souza", servico: "Habilitação", tipo: "A Receber", valor: 1000, status: "Pendente" },
]

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("todos")
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const [novoCliente, setNovoCliente] = useState("")
  const [novoServico, setNovoServico] = useState("")
  const [novoTipo, setNovoTipo] = useState("Entrada")
  const [novoValor, setNovoValor] = useState("")
  const [novoStatus, setNovoStatus] = useState("Pendente")

  useEffect(() => {
    const localData = getStorageData("transacoes", mockTransacoes)
    localData.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())
    setTransacoes(localData)
    setLoading(false)
  }, [])

  const filteredTransacoes = transacoes.filter(t => {
    let matchesSearch = true
    let matchesFilter = true

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      matchesSearch = t.cliente?.toLowerCase().includes(query) || t.servico?.toLowerCase().includes(query)
    }

    if (filterType !== "todos") {
      const mappedType = filterType === "entrada" ? "Entrada" : "A Receber"
      matchesFilter = t.tipo === mappedType
    }

    return matchesSearch && matchesFilter
  })

  const totalRecebido = transacoes.filter(t => t.tipo === "Entrada").reduce((acc, curr) => acc + curr.valor, 0)
  const totalReceber = transacoes.filter(t => t.tipo === "A Receber").reduce((acc, curr) => acc + curr.valor, 0)

  const handleAdicionarTransacao = (e: React.FormEvent) => {
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
      cliente: novoCliente,
      servico: novoServico,
      tipo: novoTipo,
      valor: valor,
      status: novoStatus
    }

    const updatedData = addStorageItem("transacoes", novaTransacao)
    setTransacoes([updatedData, ...transacoes])

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
  }

  const handleExcluirTransacao = (id: string) => {
    deleteStorageItem("transacoes", id)
    setTransacoes(transacoes.filter(t => t.id !== id))
    toast({
      title: "Sucesso",
      description: "✅ Transação excluída com sucesso!",
    })
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Financeiro</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-1 font-medium">Acompanhe o fluxo de caixa e as pendências financeiras.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-8 py-6 rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300">
              <Plus className="mr-2 h-5 w-5" /> Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-3xl">
            <form onSubmit={handleAdicionarTransacao}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900">Nova Transação</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Registre uma nova entrada ou conta a receber.
                </DialogDescription>
              </DialogHeader>
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
              <DialogFooter className="gap-3">
                <Button type="button" variant="ghost" className="rounded-xl h-12 font-bold" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl h-12 px-8 font-bold">
                  Adicionar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bento-card card-hover group relative overflow-hidden border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600"></div>
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-32 h-32 text-white" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="font-black text-white/80 text-sm uppercase tracking-wider">Total Recebido</CardTitle>
              <div className="bg-white/20 p-3 rounded-2xl">
                <ArrowUpRight className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-5xl font-black text-white tracking-tight mb-2">
                R$ {totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-white/70 text-sm font-medium">{transacoes.filter(t => t.tipo === "Entrada" && t.status === "Pago").length} transações pagas</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bento-card card-hover group relative overflow-hidden border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600"></div>
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <Wallet className="w-32 h-32 text-white" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="font-black text-white/80 text-sm uppercase tracking-wider">Total a Receber</CardTitle>
              <div className="bg-white/20 p-3 rounded-2xl">
                <ArrowDownRight className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-5xl font-black text-white tracking-tight mb-2">
                R$ {totalReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-white/70 text-sm font-medium">{transacoes.filter(t => t.tipo === "A Receber" || (t.tipo === "Entrada" && t.status === "Pendente")).length} pendências</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            type="search" 
            placeholder="Pesquisar por cliente ou serviço..." 
            className="pl-12 h-12 bg-slate-50 border-transparent focus:bg-white focus:border-orange-500 rounded-xl transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl border-slate-200 bg-white font-medium">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
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
            <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl border-slate-200 bg-white font-medium">
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

      <div className="bg-white dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 overflow-hidden transition-theme">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Data</TableHead>
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Cliente</TableHead>
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Serviço</TableHead>
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Tipo</TableHead>
              <TableHead className="text-right font-black text-slate-600 h-14">Valor</TableHead>
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Status</TableHead>
              <TableHead className="w-[80px] font-black text-slate-600 h-14">Ações</TableHead>
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
                  className="group hover:bg-orange-50/30 dark:hover:bg-orange-500/10 transition-colors border-b last:border-0"
                >
                  <TableCell className="text-slate-500 py-5 font-medium">
                    {new Date(transacao.data).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 py-5">{transacao.cliente}</TableCell>
                  <TableCell className="text-slate-600 py-5 font-medium">{transacao.servico}</TableCell>
                  <TableCell className="py-5">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider",
                      transacao.tipo === "Entrada" ? 'text-emerald-600' : 'text-orange-600'
                    )}>
                      {transacao.tipo === "Entrada" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {transacao.tipo}
                    </span>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-black py-5 text-lg",
                    transacao.tipo === "Entrada" ? 'text-emerald-600' : 'text-orange-600'
                  )}>
                    R$ {transacao.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="py-5">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      transacao.status === "Pago" ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                    )}>
                      {transacao.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                      onClick={() => handleExcluirTransacao(transacao.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
