"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { getStorageData, updateStorageItem, addStorageItem, deleteStorageItem } from "@/lib/storage"
import { LogOut, Shield, LayoutDashboard, Car, Settings, IdCard, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useRealtime } from "@/hooks/useRealtime"
import { isConfigured } from "@/lib/supabase"
import { ADMIN_CREDENTIALS, VEICULO_SERVICOS } from "@/lib/conta-constants"
import ContaDashboard from "./components/ContaDashboard"
import ContaVeiculos from "./components/ContaVeiculos"
import ContaServicos from "./components/ContaServicos"
import ContaRelatorios from "./components/ContaRelatorios"
import ContaConfig from "./components/ContaConfig"
import ModalVeiculo from "./components/ModalVeiculo"
import ModalServico from "./components/ModalServico"
import ModalCliente from "./components/ModalCliente"

export default function ContaPage() {
  const { toast } = useToast()
  const { isLoggedIn, login, logout } = useAuth()
  const router = useRouter()
  const { data: realtimeVeiculos, loading: veiculosLoading } = useRealtime<any>("veiculos", [], { column: 'contexto', value: 'habilitacao' })
  const { data: realtimeClientes, loading: clientesLoading } = useRealtime<any>("clientes", [], { column: 'contexto', value: 'habilitacao' })
  const [localVeiculos, setLocalVeiculos] = useState<any[]>([])
  const [localClientes, setLocalClientes] = useState<any[]>([])
  const [isLocalMode, setIsLocalMode] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)

  const veiculos = isLocalMode ? localVeiculos : realtimeVeiculos
  const clientes = isLocalMode ? localClientes : realtimeClientes

  const [veiculoModalOpen, setVeiculoModalOpen] = useState(false)
  const [editingVeiculo, setEditingVeiculo] = useState<any>(null)
  const [veiculoForm, setVeiculoForm] = useState({
    cliente_nome: "", placa: "", modelo: "", ano: "",
    renavam: "", crv: "", cpf: "", contato: "", servicos: [] as any[], documentos: [] as any[]
  })

  const [servicoModalOpen, setServicoModalOpen] = useState(false)
  const [servicoVeiculoIndex, setServicoVeiculoIndex] = useState<number | null>(null)
  const [servicoForm, setServicoForm] = useState({ servico_id: "", valor: "", status: "Pendente", observacoes: "" })

  const [clienteModalOpen, setClienteModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<number | null>(null)
  const [clienteForm, setClienteForm] = useState({ nome: "", cpf: "", renach: "", contato: "", servicos: [] as string[], documentos: [] as any[] })

  useEffect(() => {
    if (!isConfigured) {
      setLocalVeiculos(getStorageData("veiculos", []))
      setLocalClientes(getStorageData("clientes", []))
      setIsLocalMode(true)
      setLoading(false)
    } else {
      setIsLocalMode(false)
      // Aguarda ambos os carregamentos finalizarem
      if (!veiculosLoading && !clientesLoading) {
        setLoading(false)
      }
    }
  }, [realtimeVeiculos, veiculosLoading, realtimeClientes, clientesLoading])

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
    router.push("/")
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
      renavam: veiculoForm.renavam,
      crv: veiculoForm.crv,
      cpf: veiculoForm.cpf,
      contato: veiculoForm.contato,
      servicos: veiculoForm.servicos,
      documentos: veiculoForm.documentos,
      contexto: 'habilitacao'
    }

    try {
      if (isLocalMode) throw new Error("Local mode")
      const { supabase } = await import("@/lib/supabase")
      if (editingVeiculo !== null && veiculos[editingVeiculo]?.id) {
        const { error } = await supabase.from("veiculos").update({ ...veiculoData, updated_at: new Date().toISOString() }).eq("id", veiculos[editingVeiculo].id)
        if (error) throw error
        toast({ title: "Sucesso", description: "Veículo atualizado no sistema!" })
      } else {
        // Omite o ID para que o Supabase gere um UUID automaticamente
        const { error } = await supabase.from("veiculos").insert([{ ...veiculoData }])
        if (error) throw error
        toast({ title: "Sucesso", description: "Veículo cadastrado no sistema!" })
      }
    } catch (err: any) {
      if (editingVeiculo !== null && veiculos[editingVeiculo]?.id) {
        const updated = { ...veiculoData, id: veiculos[editingVeiculo].id, updated_at: new Date().toISOString() }
        updateStorageItem("veiculos", updated.id, updated)
        setLocalVeiculos(prev => prev.map(v => v.id === updated.id ? updated : v))
        toast({ title: "Sucesso (Local)", description: "Veículo atualizado!" })
      } else {
        const novoVeiculo = { ...veiculoData, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        addStorageItem("veiculos", novoVeiculo)
        setLocalVeiculos(prev => [...prev, novoVeiculo])
        toast({ title: "Sucesso (Local)", description: "Veículo cadastrado!" })
      }
    } finally {
      setVeiculoModalOpen(false)
      setEditingVeiculo(null)
      setVeiculoForm({ cliente_nome: "", placa: "", modelo: "", ano: "", renavam: "", crv: "", cpf: "", contato: "", servicos: [], documentos: [] })
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
      if (isLocalMode) throw new Error("Local mode")
      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase.from("veiculos").delete().eq("id", id)
      if (error) throw error
      toast({ title: "Excluído", description: "Veículo removido do sistema." })
    } catch (err) {
      deleteStorageItem("veiculos", id)
      setLocalVeiculos(prev => prev.filter(v => v.id !== id))
      toast({ title: "Excluído (Local)", description: "Veículo removido." })
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
      if (isLocalMode) throw new Error("Local mode")
      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase.from("veiculos").update({ servicos: updatedServicos, updated_at: new Date().toISOString() }).eq("id", veiculoToUpdate.id)
      if (error) throw error
      toast({ title: "Sucesso", description: "Serviço adicionado!" })
    } catch (err) {
      const updatedVeiculo = { ...veiculoToUpdate, servicos: updatedServicos }
      updateStorageItem("veiculos", updatedVeiculo.id, updatedVeiculo)
      setLocalVeiculos(prev => prev.map(v => v.id === updatedVeiculo.id ? updatedVeiculo : v))
      toast({ title: "Sucesso (Local)", description: "Serviço adicionado!" })
    } finally {
      setServicoModalOpen(false)
    }
  }

  const handleDeleteServico = async (veiculoIndex: number, servicoId: string) => {
    if (!confirm("Excluir este serviço?")) return
    const veiculoToUpdate = veiculos[veiculoIndex]
    const updatedServicos = veiculoToUpdate.servicos.filter((s: any) => s.id !== servicoId)

    try {
      if (isLocalMode) throw new Error("Local mode")
      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase.from("veiculos").update({ servicos: updatedServicos, updated_at: new Date().toISOString() }).eq("id", veiculoToUpdate.id)
      if (error) throw error
      toast({ title: "Excluído", description: "Serviço removido." })
    } catch (err) {
      const updatedVeiculo = { ...veiculoToUpdate, servicos: updatedServicos }
      updateStorageItem("veiculos", updatedVeiculo.id, updatedVeiculo)
      setLocalVeiculos(prev => prev.map(v => v.id === updatedVeiculo.id ? updatedVeiculo : v))
      toast({ title: "Excluído (Local)", description: "Serviço removido." })
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
      localStorage.removeItem("azevedo_veiculos")
      setLocalVeiculos([])
      toast({ title: "Sincronizado", description: "Dados enviados para o servidor." })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro na sincronização", description: err.message })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSaveCliente = async () => {
    if (!clienteForm.nome) {
      toast({ variant: "destructive", title: "Erro", description: "Nome é obrigatório." })
      return
    }
    if (clienteForm.cpf.replace(/\D/g, "").length === 11) {
      const { validarCPF } = await import("@/lib/validations")
      if (!validarCPF(clienteForm.cpf)) {
        toast({ variant: "destructive", title: "Erro", description: "CPF inválido." })
        return
      }
    }

    const servicosStatus: Record<string, string> = {}
    clienteForm.servicos.forEach(id => { servicosStatus[id] = "Pendente" })

    if (editingCliente !== null) {
      const existing = clientes[editingCliente]
      const updated = {
        ...existing,
        nome: clienteForm.nome,
        cpf: clienteForm.cpf,
        renach: clienteForm.renach,
        telefone: clienteForm.contato,
        servicos: clienteForm.servicos,
        servicos_status: existing.servicos_status || servicosStatus,
        documentos: clienteForm.documentos,
        updated_at: new Date().toISOString()
      }
      try {
        if (isLocalMode) throw new Error("Local mode")
        const { supabase } = await import("@/lib/supabase")
        const { error } = await supabase.from("clientes").update(updated).eq("id", existing.id)
        if (error) throw error
        toast({ title: "Sucesso", description: "Cliente atualizado!" })
      } catch (err) {
        updateStorageItem("clientes", existing.id, updated)
        setLocalClientes(prev => prev.map(c => c.id === existing.id ? updated : c))
        toast({ title: "Sucesso (Local)", description: "Cliente atualizado!" })
      }
      setEditingCliente(null)
    } else {
      const clienteData = {
        nome: clienteForm.nome,
        cpf: clienteForm.cpf,
        renach: clienteForm.renach,
        telefone: clienteForm.contato,
        servicos: clienteForm.servicos,
        servicos_status: servicosStatus,
        documentos: clienteForm.documentos,
        contexto: 'habilitacao'
      }
      
      try {
        if (isLocalMode) throw new Error("Local mode")
        const { supabase } = await import("@/lib/supabase")
        // Omite o ID para que o Supabase gere um UUID automaticamente
        const { error } = await supabase.from("clientes").insert([clienteData])
        if (error) throw error
        toast({ title: "Sucesso", description: "✅ Cliente cadastrado!" })
      } catch (err) {
        const newCliente = {
          ...clienteData,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString()
        }
        addStorageItem("clientes", newCliente)
        setLocalClientes(prev => [newCliente, ...prev])
        toast({ title: "Sucesso (Local)", description: "✅ Cliente cadastrado!" })
      }
    }
    setClienteModalOpen(false)
    setClienteForm({ nome: "", cpf: "", renach: "", contato: "", servicos: [], documentos: [] })
  }

  const openNewVeiculo = () => {
    setEditingVeiculo(null)
    setVeiculoForm({ cliente_nome: "", placa: "", modelo: "", ano: "", renavam: "", crv: "", cpf: "", contato: "", servicos: [], documentos: [] })
    setVeiculoModalOpen(true)
  }

  const openNewCliente = () => {
    setEditingCliente(null)
    setClienteForm({ nome: "", cpf: "", renach: "", contato: "", servicos: [], documentos: [] })
    setClienteModalOpen(true)
  }

  const handleEditCliente = (index: number) => {
    const c = clientes[index]
    setEditingCliente(index)
    setClienteForm({ nome: c.nome || "", cpf: c.cpf || "", renach: c.renach || "", contato: c.telefone || "", servicos: c.servicos || [], documentos: c.documentos || [] })
    setClienteModalOpen(true)
  }

  const handleDeleteCliente = async (id: string) => {
    if (!confirm("Excluir este cliente de habilitação?")) return
    try {
      if (isLocalMode) throw new Error("Local mode")
      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase.from("clientes").delete().eq("id", id)
      if (error) throw error
      toast({ title: "Excluído", description: "Cliente removido do sistema." })
    } catch (err) {
      deleteStorageItem("clientes", id)
      setLocalClientes(prev => prev.filter(c => c.id !== id))
      toast({ title: "Excluído (Local)", description: "Cliente removido." })
    }
  }

  const handleViewCliente = (id: string) => {
    router.push(`/servicos?cliente=${id}`)
  }

  const handleClearData = () => {
    if (confirm("Limpar TODOS os dados?")) {
      localStorage.removeItem("azevedo_veiculos")
      setLocalVeiculos([])
      toast({ title: "Limpo" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-orange-200 border-t-orange-500"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center py-8">
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
    <div className="min-h-screen">
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden">
        <div className="flex items-center justify-around py-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[55px]",
                activeTab === tab.id ? "text-orange-600" : "text-slate-400")}>
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id && "stroke-[2.5px]")} />
              <span className="text-[9px] font-bold">{tab.label}</span>
              {activeTab === tab.id && <motion.div layoutId="tab-indicator" className="w-5 h-0.5 bg-orange-500 rounded-full mt-0.5" />}
            </button>
          ))}
          <button onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[55px] text-red-500">
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] font-bold">Sair</span>
          </button>
        </div>
      </nav>

      <div className="hidden sm:block bg-white border-b border-slate-200 sticky top-14 sm:top-20 z-40">
        <div className="max-w-6xl mx-auto flex items-center gap-1 px-4 py-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                activeTab === tab.id ? "bg-orange-50 text-orange-600 shadow-sm border border-orange-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700")}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <Button onClick={handleLogout} size="sm" variant="ghost"
            className="ml-auto text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl font-semibold text-xs">
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 pb-24 sm:pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === "dashboard" && <ContaDashboard veiculos={veiculos} onNewVeiculo={openNewVeiculo} />}
            {activeTab === "veiculos" && <ContaVeiculos veiculos={veiculos} isLocalMode={isLocalMode} isSyncing={isSyncing} onNewVeiculo={openNewVeiculo} onEditVeiculo={handleEditVeiculo} onDeleteVeiculo={handleDeleteVeiculo} onOpenServico={handleOpenServico} onDeleteServico={handleDeleteServico} onSync={handleSyncVeiculos} />}
            {activeTab === "servicos" && <ContaServicos 
              clientes={clientes} 
              onNewCliente={openNewCliente} 
              onEditCliente={handleEditCliente} 
              onDeleteCliente={handleDeleteCliente}
              onViewCliente={handleViewCliente}
              onToggleServicoStatus={(clienteId, servicoId) => {
                const updatedClientes = clientes.map(c => {
                  if (c.id !== clienteId) return c
                  const currentStatus = c.servicos_status?.[servicoId] || "Pendente"
                  const newStatus = currentStatus === "Pendente" ? "Concluído" : "Pendente"
                  const newServicosStatus = { ...c.servicos_status, [servicoId]: newStatus }
                  const updated = { ...c, servicos_status: newServicosStatus }
                  updateStorageItem("clientes", c.id, updated)
                  return updated
                })
                setLocalClientes(updatedClientes)
                toast({ title: "Atualizado", description: "Status do serviço alterado!" })
              }} 
            />}
            {activeTab === "relatorios" && <ContaRelatorios veiculos={veiculos} />}
            {activeTab === "config" && <ContaConfig veiculos={veiculos} onClearData={handleClearData} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <ModalVeiculo open={veiculoModalOpen} onOpenChange={setVeiculoModalOpen} editing={editingVeiculo !== null} form={veiculoForm} onFormChange={setVeiculoForm} onSave={handleSaveVeiculo} />
      <ModalServico open={servicoModalOpen} onOpenChange={setServicoModalOpen} form={servicoForm} onFormChange={setServicoForm} onAdd={handleAddServico} />
      <ModalCliente open={clienteModalOpen} onOpenChange={setClienteModalOpen} editing={editingCliente !== null} form={clienteForm} onFormChange={setClienteForm} onSave={handleSaveCliente} />
    </div>
  )
}
