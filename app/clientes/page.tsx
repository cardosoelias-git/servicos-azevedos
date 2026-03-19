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
import { Plus, Search, MoreHorizontal, Edit, Trash2, UserPlus, Filter, User, Phone, Calendar } from "lucide-react"
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
import { motion } from "motion/react"
import { getStorageData, addStorageItem, deleteStorageItem } from "@/lib/storage"

const mockClientes = [
  { id: "1", nome: "João Silva", cpf: "111.222.333-44", telefone: "(11) 99999-8888", data_nascimento: "1990-05-15" },
  { id: "2", nome: "Maria Oliveira", cpf: "555.666.777-88", telefone: "(11) 97777-6666", data_nascimento: "1985-10-20" },
  { id: "3", nome: "Pedro Santos", cpf: "999.000.111-22", telefone: "(11) 95555-4444", data_nascimento: "2000-02-28" },
]

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [telefone, setTelefone] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")

  useEffect(() => {
    fetchClientes()
  }, [])

  const filteredClientes = clientes.filter(c => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return c.nome?.toLowerCase().includes(query) || 
           c.cpf?.includes(query) || 
           c.telefone?.includes(query)
  })

  const fetchClientes = async () => {
    setLoading(true)
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        throw new Error("Supabase URL não configurada")
      }
      const { data, error } = await (await import("@/lib/supabase")).supabase.from("clientes").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setClientes(data || [])
    } catch {
      const localData = getStorageData("clientes", mockClientes)
      setClientes(localData)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        throw new Error("Local mode")
      }
      const { error } = await (await import("@/lib/supabase")).supabase
        .from("clientes")
        .insert([{ nome, cpf, telefone, data_nascimento: dataNascimento }])
      if (error) throw error
      setClientes([...clientes])
      toast({ title: "Sucesso", description: "✅ Cliente criado com sucesso!" })
    } catch {
      const newCliente = {
        id: Math.random().toString(),
        nome,
        cpf,
        telefone,
        data_nascimento: dataNascimento,
        created_at: new Date().toISOString()
      }
      const updatedData = addStorageItem("clientes", newCliente)
      setClientes([updatedData, ...clientes])
      toast({ title: "Sucesso (Modo Local)", description: "✅ Cliente criado com sucesso!" })
    } finally {
      setIsModalOpen(false)
      resetForm()
    }
  }

  const handleDeleteCliente = async (id: string) => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        throw new Error("Local mode")
      }
      await (await import("@/lib/supabase")).supabase.from("clientes").delete().eq("id", id)
      setClientes(clientes.filter(c => c.id !== id))
      toast({ title: "Sucesso", description: "✅ Cliente excluído com sucesso!" })
    } catch {
      deleteStorageItem("clientes", id)
      setClientes(clientes.filter(c => c.id !== id))
      toast({ title: "Sucesso (Modo Local)", description: "✅ Cliente excluído com sucesso!" })
    }
  }

  const resetForm = () => {
    setNome("")
    setCpf("")
    setTelefone("")
    setDataNascimento("")
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 11) value = value.slice(0, 11)
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3")
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2")
    }
    setCpf(value)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 11) value = value.slice(0, 11)
    if (value.length > 10) {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{4,5})/, "($1) $2")
    }
    setTelefone(value)
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm sm:text-base">Gerencie e visualize todos os clientes cadastrados.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-4 py-4 sm:px-8 sm:py-6 rounded-xl sm:rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300">
              <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> <span className="text-sm sm:text-base">Novo Cliente</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-3xl">
            <form onSubmit={handleCreateCliente}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900">Cadastrar Cliente</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Insira as informações básicas para o novo cadastro.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="nome" className="font-semibold text-slate-700">Nome Completo</Label>
                  <Input 
                    id="nome" 
                    placeholder="Ex: João da Silva" 
                    className="rounded-xl h-12 border-slate-200 focus:ring-orange-500 focus:border-orange-500"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cpf" className="font-semibold text-slate-700">CPF</Label>
                    <Input 
                      id="cpf" 
                      placeholder="000.000.000-00" 
                      className="rounded-xl h-12 border-slate-200 focus:ring-orange-500 focus:border-orange-500"
                      value={cpf}
                      onChange={handleCpfChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telefone" className="font-semibold text-slate-700">Telefone</Label>
                    <Input 
                      id="telefone" 
                      placeholder="(00) 00000-0000" 
                      className="rounded-xl h-12 border-slate-200 focus:ring-orange-500 focus:border-orange-500"
                      value={telefone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dataNascimento" className="font-semibold text-slate-700">Data de Nascimento</Label>
                  <Input 
                    id="dataNascimento" 
                    type="date"
                    className="rounded-xl h-12 border-slate-200 focus:ring-orange-500 focus:border-orange-500"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="ghost" className="rounded-xl h-12 font-bold" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl h-12 px-8 font-bold">Salvar Cadastro</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
          <Input 
            type="search" 
            placeholder="Pesquisar..." 
            className="pl-10 sm:pl-12 h-11 sm:h-12 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-orange-500 rounded-xl transition-all text-sm sm:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 hover:border-orange-200 shrink-0 text-sm">
          <Filter className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Filtros</span>
        </Button>
      </div>

      <div className="hidden md:block bg-white dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 overflow-hidden transition-theme">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Nome</TableHead>
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">CPF</TableHead>
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Telefone</TableHead>
              <TableHead className="font-black text-slate-600 dark:text-slate-400 h-14">Data de Nascimento</TableHead>
              <TableHead className="w-[80px] font-black text-slate-600 h-14">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-48 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-10 rounded-xl" /></TableCell>
                </TableRow>
              ))
            ) : filteredClientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-400 font-medium">
                  Nenhum cliente encontrado na base de dados.
                </TableCell>
              </TableRow>
            ) : (
              filteredClientes.map((cliente, index) => (
                <motion.tr 
                  key={cliente.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-orange-50/30 dark:hover:bg-orange-500/10 transition-colors border-b last:border-0"
                >
                  <TableCell className="font-bold text-slate-900 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                        {cliente.nome.charAt(0).toUpperCase()}
                      </div>
                      {cliente.nome}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 py-5 font-mono text-sm">{cliente.cpf}</TableCell>
                  <TableCell className="text-slate-600 py-5">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-400" />
                      {cliente.telefone}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 py-5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {cliente.data_nascimento ? new Date(cliente.data_nascimento).toLocaleDateString('pt-BR') : '-'}
                    </div>
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
                        <DropdownMenuItem className="rounded-lg py-2.5 font-medium cursor-pointer hover:bg-orange-50">
                          <Edit className="mr-2 h-4 w-4 text-orange-400" /> Editar Perfil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem 
                          className="text-red-600 rounded-lg py-2.5 font-medium cursor-pointer hover:bg-red-50 focus:bg-red-50"
                          onClick={() => handleDeleteCliente(cliente.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir Cliente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <div key={i} className="bg-white dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/50">
              <Skeleton className="h-6 w-48 rounded-lg mb-4" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))
        ) : filteredClientes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/80 rounded-xl p-8 border border-slate-200/60 dark:border-slate-700/50 text-center">
            <p className="text-slate-400 dark:text-slate-500 font-medium">Nenhum cliente encontrado na base de dados.</p>
          </div>
        ) : (
          filteredClientes.map((cliente, index) => (
            <motion.div
              key={cliente.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{cliente.nome}</h3>
                  <p className="text-sm text-slate-500 font-mono">{cliente.cpf}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{cliente.telefone}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {cliente.data_nascimento ? new Date(cliente.data_nascimento).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-10 text-xs rounded-lg">
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Editar
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-red-50 hover:text-red-500" onClick={() => handleDeleteCliente(cliente.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
