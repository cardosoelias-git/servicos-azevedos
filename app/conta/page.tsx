"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { getStorageData, updateStorageItem, addStorageItem, deleteStorageItem } from "@/lib/storage"
import Link from "next/link"
import {
  Lock, LogOut, User, Car, Settings, ChevronRight, Plus, Trash2, Edit2, Save,
  ArrowLeft, CheckCircle2, Clock, DollarSign, FileText, CreditCard, Palette,
  Shield, Bell, Database, LayoutDashboard, Wrench, Users, BarChart3, Circle, TrendingUp,
  Calendar, Tag, AlertCircle, Download, Eye, Filter, Search, X, RefreshCw, MoreHorizontal
} from "lucide-react"

const ADMIN_CREDENTIALS = {
  email: "azevedo@azevedo.com",
  password: "E2645nino"
}

const VEICULO_SERVICOS = [
  { id: "transferencia_nome", nome: "Transferência de Nome", preco_padrao: 350 },
  { id: "transferencia_nome_cidade", nome: "Transferência de Nome e Cidade", preco_padrao: 500 },
  { id: "licenciamento", nome: "Licenciamento Anual", preco_padrao: 150 },
  { id: "multas", nome: "Consulta e Pagamento de Multas", preco_padrao: 80 },
  { id: "ipva", nome: "IPVA", preco_padrao: 0 },
  { id: "sinistro", nome: "Sinistro / Baixa", preco_padrao: 200 },
  { id: "placa", nome: "Troca de Placa", preco_padrao: 120 },
  { id: "certidao", nome: "Certidão de Veículo", preco_padrao: 60 },
]

export default function ContaPage() {
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)

  // Veículos
  const [veiculos, setVeiculos] = useState<any[]>([])
  const [veiculoModalOpen, setVeiculoModalOpen] = useState(false)
  const [editingVeiculo, setEditingVeiculo] = useState<any>(null)
  const [veiculoForm, setVeiculoForm] = useState({
    cliente_nome: "",
    placa: "",
    modelo: "",
    ano: "",
    cor: "",
    servicos: [] as any[]
  })

  // Serviço do veículo
  const [servicoModalOpen, setServicoModalOpen] = useState(false)
  const [servicoVeiculoIndex, setServicoVeiculoIndex] = useState<number | null>(null)
  const [servicoForm, setServicoForm] = useState({
    servico_id: "",
    valor: "",
    status: "Pendente",
    observacoes: ""
  })

  useEffect(() => {
    const loggedIn = localStorage.getItem("conta_logged_in")
    if (loggedIn === "true") {
      setIsLoggedIn(true)
    }
    setVeiculos(getStorageData("veiculos", []))
    setLoading(false)
  }, [])

  const handleLogin = () => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem("conta_logged_in", "true")
      setIsLoggedIn(true)
      toast({ title: "Sucesso", description: "Login realizado com sucesso!" })
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Email ou senha incorretos." })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("conta_logged_in")
    setIsLoggedIn(false)
    setEmail("")
    setPassword("")
  }

  // Veículos
  const handleSaveVeiculo = () => {
    if (!veiculoForm.cliente_nome || !veiculoForm.placa) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha cliente e placa." })
      return
    }

    if (editingVeiculo !== null) {
      const updated = [...veiculos]
      updated[editingVeiculo] = { ...veiculoForm, id: updated[editingVeiculo].id, updated_at: new Date().toISOString() }
      setVeiculos(updated)
      updateStorageItem("veiculos", updated[editingVeiculo].id, updated[editingVeiculo])
      toast({ title: "Sucesso", description: "Veículo atualizado!" })
    } else {
      const novoVeiculo = {
        ...veiculoForm,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const updated = [...veiculos, novoVeiculo]
      setVeiculos(updated)
      addStorageItem("veiculos", novoVeiculo)
      toast({ title: "Sucesso", description: "Veículo cadastrado!" })
    }

    setVeiculoModalOpen(false)
    setEditingVeiculo(null)
    setVeiculoForm({ cliente_nome: "", placa: "", modelo: "", ano: "", cor: "", servicos: [] })
  }

  const handleEditVeiculo = (index: number) => {
    setEditingVeiculo(index)
    setVeiculoForm({ ...veiculos[index] })
    setVeiculoModalOpen(true)
  }

  const handleDeleteVeiculo = (id: string) => {
    if (!confirm("Excluir este veículo?")) return
    const updated = veiculos.filter(v => v.id !== id)
    setVeiculos(updated)
    deleteStorageItem("veiculos", id)
    toast({ title: "Excluído", description: "Veículo removido." })
  }

  // Serviços do veículo
  const handleOpenServico = (veiculoIndex: number) => {
    setServicoVeiculoIndex(veiculoIndex)
    setServicoForm({ servico_id: "", valor: "", status: "Pendente", observacoes: "" })
    setServicoModalOpen(true)
  }

  const handleAddServico = () => {
    if (!servicoForm.servico_id || servicoVeiculoIndex === null) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione um serviço." })
      return
    }

    const servicoPadrao = VEICULO_SERVICOS.find(s => s.id === servicoForm.servico_id)
    const novoServico = {
      ...servicoForm,
      nome: servicoPadrao?.nome || servicoForm.servico_id,
      id: Date.now().toString(),
      valor: parseFloat(servicoForm.valor) || servicoPadrao?.preco_padrao || 0,
      created_at: new Date().toISOString()
    }

    const updated = [...veiculos]
    updated[servicoVeiculoIndex].servicos = [...(updated[servicoVeiculoIndex].servicos || []), novoServico]
    setVeiculos(updated)
    updateStorageItem("veiculos", updated[servicoVeiculoIndex].id, updated[servicoVeiculoIndex])

    toast({ title: "Sucesso", description: "Serviço adicionado!" })
    setServicoModalOpen(false)
  }

  const handleDeleteServico = (veiculoIndex: number, servicoId: string) => {
    if (!confirm("Excluir este serviço?")) return
    const updated = [...veiculos]
    updated[veiculoIndex].servicos = updated[veiculoIndex].servicos.filter((s: any) => s.id !== servicoId)
    setVeiculos(updated)
    updateStorageItem("veiculos", updated[veiculoIndex].id, updated[veiculoIndex])
    toast({ title: "Excluído", description: "Serviço removido." })
  }

  // Estatísticas
  const totalVeiculos = veiculos.length
  const totalServicos = veiculos.reduce((acc, v) => acc + (v.servicos?.length || 0), 0)
  const servicosPendentes = veiculos.reduce((acc, v) => acc + (v.servicos?.filter((s: any) => s.status === "Pendente").length || 0), 0)
  const servicosConcluidos = veiculos.reduce((acc, v) => acc + (v.servicos?.filter((s: any) => s.status === "Concluído").length || 0), 0)
  const valorTotalServicos = veiculos.reduce((acc, v) => acc + (v.servicos?.reduce((a: number, s: any) => a + (s.valor || 0), 0) || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-orange-500"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl shadow-orange-500/10 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-black">Área da Conta</CardTitle>
              <CardDescription className="text-orange-100 mt-2">Faça login para acessar o painel administrativo</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-5">
              <div>
                <Label className="text-sm font-bold text-slate-700">Email</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div>
                <Label className="text-sm font-bold text-slate-700">Senha</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <Button
                onClick={handleLogin}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-bold text-base shadow-lg shadow-orange-500/25"
              >
                Entrar
              </Button>
              <div className="text-center">
                <Link href="/" className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                  ← Voltar ao site
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Painel Administrativo</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gerencie veículos, serviços e mais</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="rounded-xl font-bold text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </div>

      {/* Tabs de navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto p-1 bg-slate-100 rounded-2xl gap-1">
          <TabsTrigger value="dashboard" className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <LayoutDashboard className="w-4 h-4 mr-1.5 hidden sm:block" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="veiculos" className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Car className="w-4 h-4 mr-1.5 hidden sm:block" /> Veículos
          </TabsTrigger>
          <TabsTrigger value="servicos" className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Wrench className="w-4 h-4 mr-1.5 hidden sm:block" /> Serviços
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm hidden sm:flex">
            <BarChart3 className="w-4 h-4 mr-1.5" /> Relatórios
          </TabsTrigger>
          <TabsTrigger value="config" className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm hidden sm:flex">
            <Settings className="w-4 h-4 mr-1.5" /> Config
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Veículos</p>
                    <p className="text-2xl sm:text-3xl font-black text-blue-700">{totalVeiculos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Serviços</p>
                    <p className="text-2xl sm:text-3xl font-black text-purple-700">{totalServicos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Pendentes</p>
                    <p className="text-2xl sm:text-3xl font-black text-orange-700">{servicosPendentes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Total</p>
                    <p className="text-lg sm:text-2xl font-black text-emerald-700">R$ {valorTotalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Veículos */}
        <TabsContent value="veiculos" className="mt-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-black text-slate-900">Veículos</CardTitle>
              <Button onClick={() => { setEditingVeiculo(null); setVeiculoForm({ cliente_nome: "", placa: "", modelo: "", ano: "", cor: "", servicos: [] }); setVeiculoModalOpen(true) }} className="rounded-xl font-bold bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" /> Novo Veículo
              </Button>
            </CardHeader>
            <CardContent>
              {veiculos.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold text-lg">Nenhum veículo cadastrado</p>
                  <p className="text-slate-400 text-sm mt-1">Cadastre o primeiro veículo para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {veiculos.map((veiculo, index) => (
                    <motion.div
                      key={veiculo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-orange-200 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                            <Car className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-base">{veiculo.cliente_nome}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{veiculo.placa}</span>
                              <span className="text-xs text-slate-500">{veiculo.modelo} {veiculo.ano}</span>
                              {veiculo.cor && <span className="text-xs text-slate-400">• {veiculo.cor}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenServico(index)} className="rounded-lg text-purple-600 hover:bg-purple-50">
                            <Plus className="w-4 h-4 mr-1" /> Serviço
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditVeiculo(index)} className="rounded-lg hover:bg-blue-50 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteVeiculo(veiculo.id)} className="rounded-lg hover:bg-red-50 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Serviços do veículo */}
                      {veiculo.servicos && veiculo.servicos.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Serviços ({veiculo.servicos.length})</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {veiculo.servicos.map((servico: any) => (
                              <div key={servico.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    servico.status === "Concluído" ? "bg-emerald-500" : "bg-orange-400"
                                  )} />
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">{servico.nome}</p>
                                    <p className="text-xs text-slate-500">R$ {(servico.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-red-100 hover:text-red-500" onClick={() => handleDeleteServico(index, servico.id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Serviços */}
        <TabsContent value="servicos" className="mt-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-black text-slate-900">Todos os Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              {totalServicos === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold text-lg">Nenhum serviço registrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {veiculos.map((veiculo) => (
                    veiculo.servicos?.map((servico: any) => (
                      <div key={servico.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            servico.status === "Concluído" ? "bg-emerald-100" : "bg-orange-100"
                          )}>
                            {servico.status === "Concluído" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-orange-600" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{servico.nome}</p>
                            <p className="text-xs text-slate-500">{veiculo.cliente_nome} • {veiculo.placa}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">R$ {(servico.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          <span className={cn(
                            "text-xs font-bold",
                            servico.status === "Concluído" ? "text-emerald-600" : "text-orange-600"
                          )}>{servico.status}</span>
                        </div>
                      </div>
                    ))
                  )).flat()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="relatorios" className="mt-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-black text-slate-900">Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-blue-800">Resumo Geral</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-blue-700">Total de Veículos</span><span className="font-bold text-blue-900">{totalVeiculos}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-blue-700">Total de Serviços</span><span className="font-bold text-blue-900">{totalServicos}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-blue-700">Serviços Pendentes</span><span className="font-bold text-blue-900">{servicosPendentes}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-blue-700">Serviços Concluídos</span><span className="font-bold text-blue-900">{servicosConcluidos}</span></div>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-emerald-800">Financeiro</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-emerald-700">Valor Total</span><span className="font-bold text-emerald-900">R$ {valorTotalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-emerald-700">Ticket Médio</span><span className="font-bold text-emerald-900">R$ {totalServicos > 0 ? (valorTotalServicos / totalServicos).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "0,00"}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config */}
        <TabsContent value="config" className="mt-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-black text-slate-900">Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-slate-600" />
                    <p className="font-bold text-slate-800">Segurança</p>
                  </div>
                  <p className="text-sm text-slate-500">Email: {ADMIN_CREDENTIALS.email}</p>
                  <p className="text-sm text-slate-500 mt-1">Para alterar a senha, contate o administrador do sistema.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-5 h-5 text-slate-600" />
                    <p className="font-bold text-slate-800">Dados</p>
                  </div>
                  <p className="text-sm text-slate-500">Veículos cadastrados: {totalVeiculos}</p>
                  <p className="text-sm text-slate-500 mt-1">Serviços registrados: {totalServicos}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="font-bold text-red-800">Zona de Perigo</p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl font-bold text-red-500 border-red-200 hover:bg-red-100"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja limpar TODOS os dados de veículos?")) {
                        localStorage.removeItem("azevedo_veiculos")
                        setVeiculos([])
                        toast({ title: "Dados limpos", description: "Todos os veículos foram removidos." })
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Limpar Dados de Veículos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Veículo */}
      <Dialog open={veiculoModalOpen} onOpenChange={setVeiculoModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">{editingVeiculo !== null ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="font-semibold">Nome do Cliente *</Label>
              <Input value={veiculoForm.cliente_nome} onChange={(e) => setVeiculoForm({ ...veiculoForm, cliente_nome: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="Nome completo" />
            </div>
            <div>
              <Label className="font-semibold">Placa *</Label>
              <Input value={veiculoForm.placa} onChange={(e) => setVeiculoForm({ ...veiculoForm, placa: e.target.value.toUpperCase() })} className="mt-1 h-11 rounded-xl" placeholder="ABC1D23" />
            </div>
            <div>
              <Label className="font-semibold">Modelo</Label>
              <Input value={veiculoForm.modelo} onChange={(e) => setVeiculoForm({ ...veiculoForm, modelo: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="Fiat Uno, Gol, etc." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-semibold">Ano</Label>
                <Input value={veiculoForm.ano} onChange={(e) => setVeiculoForm({ ...veiculoForm, ano: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="2020" />
              </div>
              <div>
                <Label className="font-semibold">Cor</Label>
                <Input value={veiculoForm.cor} onChange={(e) => setVeiculoForm({ ...veiculoForm, cor: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="Branco" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setVeiculoModalOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleSaveVeiculo} className="rounded-xl font-bold bg-orange-500 hover:bg-orange-600">
              <Save className="w-4 h-4 mr-2" /> Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Serviço */}
      <Dialog open={servicoModalOpen} onOpenChange={setServicoModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Adicionar Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="font-semibold">Tipo de Serviço *</Label>
              <Select value={servicoForm.servico_id} onValueChange={(val) => {
                const servico = VEICULO_SERVICOS.find(s => s.id === val)
                setServicoForm({ ...servicoForm, servico_id: val, valor: servico?.preco_padrao.toString() || "" })
              }}>
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {VEICULO_SERVICOS.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.nome} - R$ {s.preco_padrao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Valor (R$)</Label>
              <Input type="number" value={servicoForm.valor} onChange={(e) => setServicoForm({ ...servicoForm, valor: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="0.00" />
            </div>
            <div>
              <Label className="font-semibold">Status</Label>
              <Select value={servicoForm.status} onValueChange={(val) => setServicoForm({ ...servicoForm, status: val })}>
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Observações</Label>
              <Input value={servicoForm.observacoes} onChange={(e) => setServicoForm({ ...servicoForm, observacoes: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="Informações adicionais" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setServicoModalOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleAddServico} className="rounded-xl font-bold bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
