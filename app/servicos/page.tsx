"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Eye, FileText, ClipboardList, Filter, Trash2, Car, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { getStorageData, addStorageItem, deleteStorageItem } from "@/lib/storage"

const mockServicos = [
  { id: "1", cliente_nome: "João Silva", tipo_servico: "Habilitação", etapas_completas: 2, total_etapas: 9, valor_pago: 500, valor_receber: 1500, status: "Em Andamento" },
  { id: "2", cliente_nome: "Maria Oliveira", tipo_servico: "Renovação", etapas_completas: 4, total_etapas: 4, valor_pago: 350, valor_receber: 0, status: "Concluído" },
  { id: "3", cliente_nome: "Pedro Santos", tipo_servico: "Adição de Categoria", etapas_completas: 1, total_etapas: 7, valor_pago: 200, valor_receber: 800, status: "Em Andamento" },
]

const tiposServico = [
  "Habilitação",
  "Renovação",
  "Adição de Categoria",
  "Mudança de Categoria"
]

export default function ServicosPage() {
  const [servicos, setServicos] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const [clienteId, setClienteId] = useState("")
  const [tipoServico, setTipoServico] = useState("")
  const [valorTotal, setValorTotal] = useState("")
  const [valorPago, setValorPago] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const filteredServicos = servicos.filter(s => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return s.cliente_nome?.toLowerCase().includes(query) || 
           s.clientes?.nome?.toLowerCase().includes(query) ||
           s.tipo_servico?.toLowerCase().includes(query)
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        throw new Error("Supabase URL não configurada")
      }
      const { data: servicosData } = await (await import("@/lib/supabase")).supabase
        .from("servicos")
        .select(`*, clientes (nome)`)
        .order("created_at", { ascending: false })
      const { data: clientesData } = await (await import("@/lib/supabase")).supabase
        .from("clientes")
        .select("id, nome")
      setServicos(servicosData || [])
      setClientes(clientesData || [])
    } catch {
      const localServicos = getStorageData("servicos", mockServicos)
      const localClientes = getStorageData("clientes", [
        { id: "1", nome: "João Silva" },
        { id: "2", nome: "Maria Oliveira" },
      ])
      setServicos(localServicos)
      setClientes(localClientes)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateServico = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        throw new Error("Local mode")
      }
      const { error } = await (await import("@/lib/supabase")).supabase
        .from("servicos")
        .insert([{ 
          cliente_id: clienteId, 
          tipo_servico: tipoServico,
          valor_total: parseFloat(valorTotal.replace(",", ".")) || 0,
          valor_pago: parseFloat(valorPago.replace(",", ".")) || 0,
          valor_receber: (parseFloat(valorTotal.replace(",", ".")) || 0) - (parseFloat(valorPago.replace(",", ".")) || 0),
          status: "Em Andamento"
        }])
      if (error) throw error
      toast({ title: "Sucesso", description: "✅ Serviço criado com sucesso!" })
      fetchData()
    } catch {
      const vTotal = parseFloat(valorTotal.replace(",", ".")) || 0
      const vPago = parseFloat(valorPago.replace(",", ".")) || 0
      
      const newServico = {
        id: Math.random().toString(),
        cliente_id: clienteId,
        cliente_nome: clientes.find(c => c.id === clienteId)?.nome || "Cliente Desconhecido",
        tipo_servico: tipoServico,
        etapas_completas: 0,
        total_etapas: tipoServico === "Habilitação" ? 9 : tipoServico === "Renovação" ? 4 : 7,
        valor_total: vTotal,
        valor_pago: vPago,
        valor_receber: vTotal - vPago,
        status: "Em Andamento",
        created_at: new Date().toISOString()
      }
      
      const updatedData = addStorageItem("servicos", newServico)
      
      if (vPago > 0) {
        addStorageItem("transacoes", {
          id: Math.random().toString(),
          data: new Date().toISOString(),
          cliente: newServico.cliente_nome,
          servico: tipoServico,
          tipo: "Entrada",
          valor: vPago,
          status: "Pago"
        })
      }
      if (vTotal - vPago > 0) {
        addStorageItem("transacoes", {
          id: Math.random().toString(),
          data: new Date().toISOString(),
          cliente: newServico.cliente_nome,
          servico: tipoServico,
          tipo: "A Receber",
          valor: vTotal - vPago,
          status: "Pendente"
        })
      }

      setServicos([updatedData, ...servicos])
      toast({ title: "Sucesso (Modo Local)", description: "✅ Serviço criado com sucesso!" })
    } finally {
      setIsModalOpen(false)
      resetForm()
    }
  }

  const handleDeleteServico = async (id: string) => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        throw new Error("Local mode")
      }
      await (await import("@/lib/supabase")).supabase.from("servicos").delete().eq("id", id)
      setServicos(servicos.filter(s => s.id !== id))
      toast({ title: "Sucesso", description: "✅ Serviço excluído com sucesso!" })
    } catch {
      deleteStorageItem("servicos", id)
      setServicos(servicos.filter(s => s.id !== id))
      toast({ title: "Sucesso (Modo Local)", description: "✅ Serviço excluído com sucesso!" })
    }
  }

  const resetForm = () => {
    setClienteId("")
    setTipoServico("")
    setValorTotal("")
    setValorPago("")
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Serviços</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Acompanhe o progresso de cada processo de habilitação.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-8 py-6 rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300">
              <Plus className="mr-2 h-5 w-5" /> Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-3xl">
            <form onSubmit={handleCreateServico}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900">Iniciar Serviço</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Selecione o cliente e o tipo de serviço para começar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="cliente" className="font-semibold text-slate-700">Cliente</Label>
                  <Select value={clienteId} onValueChange={setClienteId} required>
                    <SelectTrigger className="rounded-xl h-12 border-slate-200 focus:ring-orange-500 focus:border-orange-500">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {clientes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo" className="font-semibold text-slate-700">Tipo de Serviço</Label>
                  <Select value={tipoServico} onValueChange={setTipoServico} required>
                    <SelectTrigger className="rounded-xl h-12 border-slate-200 focus:ring-orange-500 focus:border-orange-500">
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {tiposServico.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="valorTotal" className="font-semibold text-slate-700">Valor Total (R$)</Label>
                    <Input 
                      id="valorTotal" 
                      placeholder="0,00" 
                      className="rounded-xl h-12 border-slate-200 focus:ring-orange-500 focus:border-orange-500"
                      value={valorTotal}
                      onChange={(e) => setValorTotal(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="valorPago" className="font-semibold text-slate-700">Valor Pago (R$)</Label>
                    <Input 
                      id="valorPago" 
                      placeholder="0,00" 
                      className="rounded-xl h-12 border-slate-200 focus:ring-orange-500 focus:border-orange-500"
                      value={valorPago}
                      onChange={(e) => setValorPago(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="ghost" className="rounded-xl h-12 font-bold" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl h-12 px-8 font-bold">Criar Processo</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-theme">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            type="search" 
            placeholder="Pesquisar por cliente ou serviço..." 
            className="pl-12 h-12 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-orange-500 rounded-xl transition-all text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 hover:border-orange-200 shrink-0">
          <Filter className="mr-2 h-4 w-4" /> Filtros
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 overflow-hidden transition-theme">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Cliente</TableHead>
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Serviço</TableHead>
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Progresso</TableHead>
              <TableHead className="text-right font-black text-slate-600 h-14">Financeiro</TableHead>
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Status</TableHead>
              <TableHead className="w-[80px] font-black text-slate-600 h-14">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-48 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-40 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 ml-auto rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-10 rounded-xl" /></TableCell>
                </TableRow>
              ))
            ) : filteredServicos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-slate-400 dark:text-slate-500 font-medium">
                  Nenhum serviço em andamento no momento.
                </TableCell>
              </TableRow>
            ) : (
              filteredServicos.map((servico, index) => {
                const progress = Math.round(((servico.etapas_completas || 0) / (servico.total_etapas || 9)) * 100);
                return (
                  <motion.tr 
                    key={servico.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-orange-50/30 dark:hover:bg-orange-500/10 transition-colors border-b last:border-0"
                  >
                    <TableCell className="font-bold text-slate-900 py-5">
                      {servico.clientes?.nome || servico.cliente_nome}
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-orange-400" />
                        <span className="text-slate-600 font-medium">{servico.tipo_servico}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="w-full max-w-[160px] space-y-1.5">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          <span>{servico.etapas_completas || 0} / {servico.total_etapas || 9} ETAPAS</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full",
                              progress === 100 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-orange-500 to-orange-400"
                            )}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-5">
                      <div className="space-y-0.5">
                        <div className="text-emerald-600 font-bold text-sm">
                          R$ {(servico.valor_pago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-orange-500 font-medium text-[11px]">
                          Faltam R$ {(servico.valor_receber || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold",
                        servico.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        servico.status === 'Cancelado' ? 'bg-red-50 text-red-600 border border-red-100' : 
                        'bg-orange-50 text-orange-600 border border-orange-100'
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full mr-2 animate-pulse",
                          servico.status === 'Concluído' ? 'bg-emerald-500' : 
                          servico.status === 'Cancelado' ? 'bg-red-500' : 
                          'bg-orange-500'
                        )} />
                        {servico.status || 'Em Andamento'}
                      </span>
                    </TableCell>
                    <TableCell className="py-5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-orange-50 hover:text-orange-500 transition-all">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-5 w-5 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-xl border-slate-200/60">
                          <DropdownMenuLabel className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Gerenciar</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="rounded-lg py-2.5 font-medium cursor-pointer hover:bg-orange-50">
                            <Link href={`/servicos/${servico.id}`}>
                              <Eye className="mr-2 h-4 w-4 text-orange-400" /> Ver Detalhes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg py-2.5 font-medium cursor-pointer hover:bg-orange-50">
                            <FileText className="mr-2 h-4 w-4 text-slate-400" /> Gerar Recibo
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem 
                            className="text-red-600 rounded-lg py-2.5 font-medium cursor-pointer hover:bg-red-50 focus:bg-red-50"
                            onClick={() => handleDeleteServico(servico.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Cancelar Serviço
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
