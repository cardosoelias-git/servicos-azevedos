"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { getStorageData, updateStorageItem, addStorageItem, deleteStorageItem } from "@/lib/storage"
import {
  Lock, LogOut, Car, Settings, Plus, Trash2, Edit2, Save,
  CheckCircle2, Clock, DollarSign, Shield, Database, LayoutDashboard,
  Wrench, BarChart3, TrendingUp, AlertCircle, BadgeCheck, IdCard, RefreshCw
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRealtime } from "@/hooks/useRealtime"
import { isConfigured } from "@/lib/supabase"

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
  const { isLoggedIn, login, logout } = useAuth()
  const { data: realtimeVeiculos, loading: veiculosLoading } = useRealtime<any>("veiculos")
  const [localVeiculos, setLocalVeiculos] = useState<any[]>([])
  const [isLocalMode, setIsLocalMode] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)

  const [placa, setPlaca] = useState("")
  const [modelo, setModelo] = useState("")
  const [proprietario, setProprietario] = useState("")

  const veiculos = isLocalMode ? localVeiculos : realtimeVeiculos

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

  const [servicoModalOpen, setServicoModalOpen] = useState(false)
  const [servicoVeiculoIndex, setServicoVeiculoIndex] = useState<number | null>(null)
  const [servicoForm, setServicoForm] = useState({
    servico_id: "",
    valor: "",
    status: "Pendente",
    observacoes: ""
  })

  useEffect(() => {
    if (!isConfigured) {
      setLocalVeiculos(getStorageData("veiculos", []))
      setIsLocalMode(true)
      setLoading(false)
    } else {
      setIsLocalMode(false)
      if (!veiculosLoading) {
        setLoading(false)
      }
    }
  }, [realtimeVeiculos, veiculosLoading])

  const handleLogin = () => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      login()
      toast({ title: "Sucesso", description: "Login realizado!" })
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Email ou senha incorretos." })
    }
  }

  const handleLogout = () => {
    logout()
    setEmail("")
    setPassword("")
  }

  const handleSaveVeiculo = async () => {
    if (!veiculoForm.cliente_nome || !veiculoForm.placa) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha cliente e placa." })
      return
    }

    const veiculoData = {
      cliente_nome: veiculoForm.cliente_nome,
      placa: veiculoForm.placa.toUpperCase(),
      modelo: veiculoForm.modelo,
      ano: veiculoForm.ano,
      cor: veiculoForm.cor,
      servicos: veiculoForm.servicos,
    }

    try {
      if (isLocalMode) throw new Error("Local mode") // Force local storage if in local mode

      const { supabase } = await import("@/lib/supabase")
      if (editingVeiculo !== null && veiculos[editingVeiculo]?.id) {
        // Update existing vehicle
        const { error } = await supabase
          .from("veiculos")
          .update({ ...veiculoData, updated_at: new Date().toISOString() })
          .eq("id", veiculos[editingVeiculo].id)

        if (error) throw error
        toast({ title: "Sucesso", description: "Veículo atualizado no sistema!" })
      } else {
        // Add new vehicle
        const { error } = await supabase
          .from("veiculos")
          .insert([{ ...veiculoData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])

        if (error) throw error
        toast({ title: "Sucesso", description: "Veículo cadastrado no sistema!" })
      }
    } catch (err: any) {
      if (editingVeiculo !== null && veiculos[editingVeiculo]?.id) {
        // Update local storage
        const updated = { ...veiculoData, id: veiculos[editingVeiculo].id, updated_at: new Date().toISOString() }
        updateStorageItem("veiculos", updated.id, updated)
        setLocalVeiculos(prev => prev.map(v => v.id === updated.id ? updated : v))
        toast({ title: "Sucesso (Local)", description: "Veículo atualizado no navegador!" })
      } else {
        // Add to local storage
        const novoVeiculo = { ...veiculoData, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        addStorageItem("veiculos", novoVeiculo)
        setLocalVeiculos(prev => [...prev, novoVeiculo])
        toast({ title: "Sucesso (Local)", description: "Veículo cadastrado no navegador!" })
      }
    } finally {
      setVeiculoModalOpen(false)
      setEditingVeiculo(null)
      setVeiculoForm({ cliente_nome: "", placa: "", modelo: "", ano: "", cor: "", servicos: [] })
    }
  }

  const handleEditVeiculo = (index: number) => {
    setEditingVeiculo(index)
    setVeiculoForm({ ...veiculos[index] })
    setVeiculoModalOpen(true)
  }

  const handleDeleteVeiculo = async (id: string) => {
    if (!confirm("Excluir este veículo?")) return

    try {
      if (isLocalMode) throw new Error("Local mode") // Force local storage if in local mode

      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase
        .from("veiculos")
        .delete()
        .eq("id", id)

      if (error) throw error
      toast({ title: "Excluído", description: "Veículo removido do sistema." })
    } catch (err) {
      deleteStorageItem("veiculos", id)
      setLocalVeiculos(prev => prev.filter(v => v.id !== id))
      toast({ title: "Excluído (Local)", description: "Veículo removido do navegador." })
    }
  }

  const handleOpenServico = (veiculoIndex: number) => {
    setServicoVeiculoIndex(veiculoIndex)
    setServicoForm({ servico_id: "", valor: "", status: "Pendente", observacoes: "" })
    setServicoModalOpen(true)
  }

  const handleAddServico = async () => {
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

    const veiculoToUpdate = veiculos[servicoVeiculoIndex]
    const updatedServicos = [...(veiculoToUpdate.servicos || []), novoServico]

    try {
      if (isLocalMode) throw new Error("Local mode") // Force local storage if in local mode

      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase
        .from("veiculos")
        .update({ servicos: updatedServicos, updated_at: new Date().toISOString() })
        .eq("id", veiculoToUpdate.id)

      if (error) throw error
      toast({ title: "Sucesso", description: "Serviço adicionado ao sistema!" })
    } catch (err) {
      // Update local storage
      const updatedVeiculo = { ...veiculoToUpdate, servicos: updatedServicos }
      updateStorageItem("veiculos", updatedVeiculo.id, updatedVeiculo)
      setLocalVeiculos(prev => prev.map(v => v.id === updatedVeiculo.id ? updatedVeiculo : v))
      toast({ title: "Sucesso (Local)", description: "Serviço adicionado no navegador!" })
    } finally {
      setServicoModalOpen(false)
    }
  }

  const handleDeleteServico = async (veiculoIndex: number, servicoId: string) => {
    if (!confirm("Excluir este serviço?")) return

    const veiculoToUpdate = veiculos[veiculoIndex]
    const updatedServicos = veiculoToUpdate.servicos.filter((s: any) => s.id !== servicoId)

    try {
      if (isLocalMode) throw new Error("Local mode") // Force local storage if in local mode

      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase
        .from("veiculos")
        .update({ servicos: updatedServicos, updated_at: new Date().toISOString() })
        .eq("id", veiculoToUpdate.id)

      if (error) throw error
      toast({ title: "Excluído", description: "Serviço removido do sistema." })
    } catch (err) {
      // Update local storage
      const updatedVeiculo = { ...veiculoToUpdate, servicos: updatedServicos }
      updateStorageItem("veiculos", updatedVeiculo.id, updatedVeiculo)
      setLocalVeiculos(prev => prev.map(v => v.id === updatedVeiculo.id ? updatedVeiculo : v))
      toast({ title: "Excluído (Local)", description: "Serviço removido do navegador." })
    }
  }

  const handleSyncVeiculos = async () => {
    setIsSyncing(true)
    try {
      if (!isConfigured) throw new Error("Supabase não configurado")
      const localData = getStorageData("veiculos", [])
      if (localData.length === 0) {
        toast({ title: "Nada para sincronizar", description: "Não há dados locais." })
        return
      }
      const { supabase } = await import("@/lib/supabase")
      for (const v of localData) {
        const { id, ...vData } = v
        await supabase.from("veiculos").upsert([vData], { onConflict: 'placa' })
      }
      localStorage.removeItem("azevedo_veiculos") // Clear local storage after sync
      setLocalVeiculos([]) // Clear local state
      toast({ title: "Sincronizado", description: "Dados enviados para o servidor." })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro na sincronização", description: err.message })
    } finally {
      setIsSyncing(false)
    }
  }

  const totalVeiculos = veiculos.length
  const totalServicos = veiculos.reduce((acc, v) => acc + (v.servicos?.length || 0), 0)
  const servicosPendentes = veiculos.reduce((acc, v) => acc + (v.servicos?.filter((s: any) => s.status === "Pendente").length || 0), 0)
  const servicosConcluidos = veiculos.reduce((acc, v) => acc + (v.servicos?.filter((s: any) => s.status === "Concluído").length || 0), 0)
  const valorTotalServicos = veiculos.reduce((acc, v) => acc + (v.servicos?.reduce((a: number, s: any) => a + (s.valor || 0), 0) || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-orange-200 border-t-orange-500"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white text-center py-10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-10 h-10" />
              </motion.div>
              <CardTitle className="text-2xl font-black tracking-tight">CARDOSO AZEVEDO</CardTitle>
              <CardDescription className="text-orange-100 mt-2 text-sm font-medium">Painel Administrativo</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</Label>
                <Input type="email" placeholder="azevedo@azevedo.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-12 rounded-xl border-slate-200 focus:ring-orange-500 text-base"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senha</Label>
                <Input type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-12 rounded-xl border-slate-200 focus:ring-orange-500 text-base"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>
              <Button onClick={handleLogin}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-bold text-base shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:scale-[1.02]">
                Entrar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "veiculos", label: "Veículos", icon: Car },
    { id: "servicos", label: "Habilitação", icon: IdCard },
    { id: "relatorios", label: "Relatórios", icon: BarChart3 },
    { id: "config", label: "Config", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div className="flex items-center justify-between px-4 h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white">CARDOSO <span className="text-orange-400">AZEVEDO</span></h1>
            </div>
          </div>
          <Button onClick={handleLogout} size="sm" variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl font-semibold text-xs">
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden">
        <div className="flex items-center justify-around py-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[55px]",
                activeTab === tab.id ? "text-orange-600" : "text-slate-400"
              )}>
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id && "stroke-[2.5px]")} />
              <span className="text-[9px] font-bold">{tab.label}</span>
              {activeTab === tab.id && <motion.div layoutId="tab-indicator" className="w-5 h-0.5 bg-orange-500 rounded-full mt-0.5" />}
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Tabs */}
      <div className="hidden sm:block bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-40">
        <div className="max-w-6xl mx-auto flex items-center gap-1 px-4 py-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-orange-50 text-orange-600 shadow-sm border border-orange-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 pb-24 sm:pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Veículos", value: totalVeiculos, icon: Car, color: "blue" },
                    { label: "Habilitação", value: totalServicos, icon: IdCard, color: "purple" },
                    { label: "Pendentes", value: servicosPendentes, icon: Clock, color: "orange" },
                    { label: "Total", value: `R$ ${valorTotalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: DollarSign, color: "emerald" },
                  ].map((stat) => (
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
                <Button onClick={() => setActiveTab("veiculos")}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl font-bold shadow-lg shadow-orange-500/25">
                  <Plus className="w-5 h-5 mr-2" /> Novo Veículo
                </Button>
              </div>
            )}

            {/* Veículos */}
            {activeTab === "veiculos" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Frota Azevedo</h3>
                    <p className="text-slate-500 text-sm font-medium">Controle os veículos autorizados para serviços.</p>
                  </div>
                  {isLocalMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-amber-50 text-amber-600 hover:bg-amber-100"
                      onClick={handleSyncVeiculos}
                      disabled={isSyncing}
                    >
                      <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
                      Sincronizar
                    </Button>
                  )}
                </div>
                <Button onClick={() => { setEditingVeiculo(null); setVeiculoForm({ cliente_nome: "", placa: "", modelo: "", ano: "", cor: "", servicos: [] }); setVeiculoModalOpen(true) }}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl font-bold shadow-lg shadow-orange-500/25">
                  <Plus className="w-5 h-5 mr-2" /> Cadastrar Veículo
                </Button>
                {veiculos.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <Car className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-bold">Nenhum veículo cadastrado</p>
                  </div>
                ) : (
                  veiculos.map((veiculo, index) => (
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
                          <Button variant="ghost" size="icon" onClick={() => handleOpenServico(index)} className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50">
                            <BadgeCheck className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditVeiculo(index)} className="h-9 w-9 rounded-xl text-blue-600 hover:bg-blue-50">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteVeiculo(veiculo.id)} className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50">
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
                                  <button onClick={() => handleDeleteServico(index, servico.id)} className="text-red-400 hover:text-red-600 p-0.5">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Serviços */}
            {activeTab === "servicos" && (
              <div className="space-y-3">
                {totalServicos === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl">
                    <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-bold">Nenhuma habilitação registrada</p>
                  </div>
                ) : (
                  veiculos.map((veiculo) =>
                    veiculo.servicos?.map((servico: any) => (
                      <div key={servico.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                            servico.status === "Concluído" ? "bg-emerald-100" : "bg-orange-100")}>
                            {servico.status === "Concluído" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-orange-600" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{servico.nome}</p>
                            <p className="text-xs text-slate-500">{veiculo.cliente_nome} • {veiculo.placa}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">R$ {(servico.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          <span className={cn("text-[10px] font-bold uppercase",
                            servico.status === "Concluído" ? "text-emerald-600" : "text-orange-600")}>{servico.status}</span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            )}

            {/* Relatórios */}
            {activeTab === "relatorios" && (
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-white" /></div>
                    <p className="font-bold text-blue-800">Resumo Geral</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Total de Veículos", value: totalVeiculos },
                      { label: "Total de Serviços", value: totalServicos },
                      { label: "Pendentes", value: servicosPendentes },
                      { label: "Concluídos", value: servicosConcluidos },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-sm text-blue-700">{item.label}</span>
                        <span className="font-bold text-blue-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-white" /></div>
                    <p className="font-bold text-emerald-800">Financeiro</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-emerald-700">Valor Total</span><span className="font-bold text-emerald-900">R$ {valorTotalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-emerald-700">Ticket Médio</span><span className="font-bold text-emerald-900">R$ {totalServicos > 0 ? (valorTotalServicos / totalServicos).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "0,00"}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Config */}
            {activeTab === "config" && (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-3"><Shield className="w-5 h-5 text-slate-600" /><p className="font-bold text-slate-800">Segurança</p></div>
                  <p className="text-sm text-slate-500">Email: {ADMIN_CREDENTIALS.email}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-3"><Database className="w-5 h-5 text-slate-600" /><p className="font-bold text-slate-800">Dados</p></div>
                  <p className="text-sm text-slate-500">Veículos: {totalVeiculos} | Serviços: {totalServicos}</p>
                </div>
                <button onClick={() => { if (confirm("Limpar TODOS os dados?")) { localStorage.removeItem("azevedo_veiculos"); setLocalVeiculos([]); toast({ title: "Limpo" }) } }}
                  className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-left">
                  <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><p className="font-bold text-red-800">Limpar Dados</p></div>
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal Veículo */}
      <Dialog open={veiculoModalOpen} onOpenChange={setVeiculoModalOpen}>
        <DialogContent className="rounded-2xl max-w-sm mx-4">
          <DialogHeader><DialogTitle className="text-lg font-black">{editingVeiculo !== null ? "Editar Veículo" : "Novo Veículo"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-bold text-slate-500">Nome do Cliente *</Label>
              <Input value={veiculoForm.cliente_nome} onChange={(e) => setVeiculoForm({ ...veiculoForm, cliente_nome: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="Nome completo" /></div>
            <div><Label className="text-xs font-bold text-slate-500">Placa *</Label>
              <Input value={veiculoForm.placa} onChange={(e) => setVeiculoForm({ ...veiculoForm, placa: e.target.value.toUpperCase() })} className="mt-1 h-11 rounded-xl" placeholder="ABC1D23" /></div>
            <div><Label className="text-xs font-bold text-slate-500">Modelo</Label>
              <Input value={veiculoForm.modelo} onChange={(e) => setVeiculoForm({ ...veiculoForm, modelo: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="Fiat Uno" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-bold text-slate-500">Ano</Label>
                <Input value={veiculoForm.ano} onChange={(e) => setVeiculoForm({ ...veiculoForm, ano: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="2020" /></div>
              <div><Label className="text-xs font-bold text-slate-500">Cor</Label>
                <Input value={veiculoForm.cor} onChange={(e) => setVeiculoForm({ ...veiculoForm, cor: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="Branco" /></div>
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
        <DialogContent className="rounded-2xl max-w-sm mx-4">
          <DialogHeader><DialogTitle className="text-lg font-black">Adicionar Habilitação</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-bold text-slate-500">Tipo de Habilitação *</Label>
              <Select value={servicoForm.servico_id} onValueChange={(val) => {
                const servico = VEICULO_SERVICOS.find(s => s.id === val)
                setServicoForm({ ...servicoForm, servico_id: val, valor: servico?.preco_padrao.toString() || "" })
              }}>
                <SelectTrigger className="mt-1 h-11 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{VEICULO_SERVICOS.map(s => (<SelectItem key={s.id} value={s.id}>{s.nome} - R$ {s.preco_padrao}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs font-bold text-slate-500">Valor (R$)</Label>
              <Input type="number" value={servicoForm.valor} onChange={(e) => setServicoForm({ ...servicoForm, valor: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="0.00" /></div>
            <div><Label className="text-xs font-bold text-slate-500">Status</Label>
              <Select value={servicoForm.status} onValueChange={(val) => setServicoForm({ ...servicoForm, status: val })}>
                <SelectTrigger className="mt-1 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
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
