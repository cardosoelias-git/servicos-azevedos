"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2, Circle, Save, DollarSign, AlertCircle, Upload, FileText, Image as ImageIcon, Download, Trash2, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getStorageData, updateStorageItem, addStorageItem } from "@/lib/storage"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { ETAPAS_POR_TIPO } from "@/lib/constants"
import { useRef } from "react"

// Constants are now imported from @/lib/constants

export default function ServicoDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [servicoNaoEncontrado, setServicoNaoEncontrado] = useState(false)
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false)
  const [valorPagamento, setValorPagamento] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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
    fetchServico()
  }, [params.id])

  const fetchServico = async () => {
    const id = params.id as string
    
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') throw new Error()
      
      const { supabase } = await import("@/lib/supabase")
      const { data, error } = await supabase
        .from("servicos")
        .select("*, clientes (nome)")
        .eq("id", id)
        .single()
        
      if (error || !data) throw new Error()
      processServicoData({
        ...data,
        cliente_nome: data.clientes?.nome || data.cliente_nome
      })
    } catch {
      const servicos = getStorageData("servicos", [])
      const servicoData = servicos.find((s: any) => s.id === id)
      
      if (!servicoData) {
        setServicoNaoEncontrado(true)
        setLoading(false)
        return
      }
      processServicoData(servicoData)
    }
  }

  const processServicoData = (servicoData: any) => {
    setServico({
      ...servicoData,
      cliente_nome: servicoData.cliente_nome || "Desconhecido",
      documentos: servicoData.documentos || []
    })
    
    const etapasSalvas = servicoData.etapas || []
    const tipo = servicoData.tipo_servico as keyof typeof ETAPAS_POR_TIPO
    const nomesEtapas = ETAPAS_POR_TIPO[tipo] || ETAPAS_POR_TIPO["Habilitação"]
    
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
  }

  const handleUpdateEtapa = (index: number, field: string, value: any) => {
    const newEtapas = [...etapas]
    newEtapas[index] = { ...newEtapas[index], [field]: value }
    setEtapas(newEtapas)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const valorPagoReal = etapas.reduce((acc, e) => acc + (Number(e.valor_pago_etapa) || 0), 0)
      const novoStatus = etapasConcluidas === etapas.length ? "Concluído" : "Em Andamento"
      
      const updatedServico = {
        ...servico,
        etapas,
        etapas_completas: etapasConcluidas,
        total_etapas: etapas.length,
        valor_pago: valorPagoReal,
        valor_receber: Math.max(0, servico.valor_total - valorPagoReal),
        status: novoStatus
      }
      
      // Update local storage explicitly
      updateStorageItem("servicos", servico.id, updatedServico)
      
      // Update Supabase
      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase
        .from("servicos")
        .update({
          etapas,
          etapas_completas: etapasConcluidas,
          total_etapas: etapas.length,
          valor_pago: valorPagoReal,
          valor_receber: Math.max(0, servico.valor_total - valorPagoReal),
          status: novoStatus
        })
        .eq("id", servico.id)

      if (error) console.error("Erro ao sincronizar com banco:", error)
      
      setServico(updatedServico)
      
      toast({
        title: "Sucesso",
        description: "✅ Etapas atualizadas e salvas no banco!",
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
    
    // Sync with Supabase
    try {
      const { supabase } = await import("@/lib/supabase")
      await supabase
        .from("servicos")
        .update({
          valor_pago: novoValorPago,
          valor_receber: Math.max(0, novoValorReceber)
        })
        .eq("id", servico.id)
        
      await supabase
        .from("transacoes")
        .insert([{
          data: new Date().toISOString(),
          cliente: servico.cliente_nome,
          servico: servico.tipo_servico,
          tipo: "Entrada",
          valor: valor,
          status: "Pago"
        }])
    } catch(err) {
      console.error("Erro banco sync transação:", err)
    }
    
    setServico(updatedServico)
    setIsPagamentoModalOpen(false)
    setValorPagamento("")
    
    toast({
      title: "Sucesso",
      description: `✅ Pagamento de R$ ${valor.toFixed(2).replace(".", ",")} registrado no banco!`,
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
    
    try {
      const { supabase } = await import("@/lib/supabase")
      await supabase
        .from("servicos")
        .update({
          status: "Concluído",
          etapas_completas: etapas.length,
          valor_pago: servico.valor_total,
          valor_receber: 0
        })
        .eq("id", servico.id)
    } catch(err) {
      console.error(err)
    }

    setServico(updatedServico)
    
    toast({
      title: "Sucesso",
      description: "✅ Serviço concluído no banco!",
    })
  }

  const resizeImage = (file: File, maxSize: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let { width, height } = img
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            } else {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL(file.type || "image/jpeg", 0.7)) // 0.7 quality to save space
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true) // Show loading state briefly while crunching base64
    try {
      let base64 = ""
      if (file.type.startsWith("image/")) {
        base64 = await resizeImage(file, 1200)
      } else {
        base64 = await fileToBase64(file)
      }

      const novoDoc = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
        uploaded_at: new Date().toISOString()
      }

      const updatedServico = {
        ...servico,
        documentos: [...(servico.documentos || []), novoDoc]
      }

      updateStorageItem("servicos", servico.id, updatedServico)
      setServico(updatedServico)
      
      // Sync to Supabase
      try {
        const { supabase } = await import("@/lib/supabase")
        await supabase
          .from("servicos")
          .update({ documentos: updatedServico.documentos })
          .eq("id", servico.id)
      } catch(err) {
        console.warn("Could not sync doc to supabase: Is the JSONB column missing?", err)
      }

      toast({
        title: "Upload",
        description: "✅ Documento salvo com sucesso e enviado ao banco!",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro de Upload",
        description: "❌ Não foi possível salvar o arquivo.",
      })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
      setLoading(false)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Excluir este documento?")) return
    const updatedServico = {
      ...servico,
      documentos: (servico.documentos || []).filter((d: any) => d.id !== docId)
    }
    updateStorageItem("servicos", servico.id, updatedServico)
    setServico(updatedServico)
    
    // Sync to Supabase
    try {
      const { supabase } = await import("@/lib/supabase")
      await supabase
        .from("servicos")
        .update({ documentos: updatedServico.documentos })
        .eq("id", servico.id)
    } catch(err) {}

    toast({
      title: "Excluído",
      description: "✅ Documento removido do banco de dados.",
    })
  }

  const handleDownloadDocument = async (doc: any) => {
    try {
      const res = await fetch(doc.base64)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = doc.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao abrir documento."})
    }
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
  
  // Real-time financial calculations
  const valorPagoRealTime = etapas.reduce((acc, e) => acc + (Number(e.valor_pago_etapa) || 0), 0)
  const valorReceberRealTime = Math.max(0, (servico.valor_total || 0) - valorPagoRealTime)

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-orange-50 hover:text-orange-500 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 truncate">Detalhes do Serviço</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base truncate">{servico.cliente_nome} - {servico.tipo_servico}</p>
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
                    <span className="font-bold">R$ {(servico.valor_total || 0).toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Já Pago:</span>
                    <span className="font-bold">R$ {valorPagoRealTime.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-orange-500">
                    <span>Falta:</span>
                    <span className="font-bold">R$ {valorReceberRealTime.toFixed(2).replace(".", ",")}</span>
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
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <Card className="bento-card">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base sm:text-lg font-black text-slate-900">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-5">
              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Valor Total</p>
                <p className="text-lg sm:text-2xl font-black text-slate-900">R$ {(servico.valor_total || 0).toFixed(2).replace(".", ",")}</p>
              </div>
              <div className="p-3 sm:p-4 bg-emerald-50 rounded-lg sm:rounded-xl border border-emerald-100">
                <p className="text-xs sm:text-sm text-emerald-600 font-medium">Valor Pago</p>
                <p className="text-lg sm:text-2xl font-black text-emerald-600">R$ {valorPagoRealTime.toFixed(2).replace(".", ",")}</p>
              </div>
              <div className="p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl border border-orange-100">
                <p className="text-xs sm:text-sm text-orange-600 font-medium">A Receber</p>
                <p className="text-xl sm:text-3xl font-black text-orange-600">R$ {valorReceberRealTime.toFixed(2).replace(".", ",")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bento-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-4">
              <CardTitle className="text-base sm:text-lg font-black text-slate-900">Documentos</CardTitle>
              <Button variant="outline" className="h-8 px-3 rounded-lg text-xs font-bold border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Adicionar
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {(!servico.documentos || servico.documentos.length === 0) ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">Nenhum documento.</p>
                  <p className="text-xs text-slate-400 mt-1">Envie FOTO, RENACH, etc.</p>
                </div>
              ) : (
                servico.documentos.map((doc: any) => (
                  <div key={doc.id} className="group flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 text-slate-500 group-hover:text-orange-500 group-hover:bg-orange-50 transition-colors">
                        {doc.type.startsWith("image/") ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mt-0.5">{(doc.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pl-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600" onClick={() => handleDownloadDocument(doc)} title="Baixar / Abrir">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-500" onClick={() => handleDeleteDocument(doc.id)} title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bento-card lg:col-span-2">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base sm:text-lg font-black text-slate-900">Progresso das Etapas</CardTitle>
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
                      ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300" 
                      : "bg-white border-slate-200 hover:border-orange-200 hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 text-sm sm:text-base font-bold",
                    etapa.concluido 
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30" 
                      : "bg-slate-100 text-slate-400"
                  )}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                      <h3 className={cn(
                        "font-bold text-base sm:text-lg transition-all truncate",
                        etapa.concluido ? "text-emerald-700" : "text-slate-900"
                      )}>{etapa.nome_etapa}</h3>
                      <div className="flex items-center gap-2 bg-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
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
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-bold text-slate-400">R$</span>
                          <Input 
                            type="number" 
                            className="h-9 sm:h-10 pl-8 text-xs sm:text-sm font-medium rounded-lg border-slate-200 focus:ring-orange-500" 
                            value={etapa.valor_pago_etapa || ""}
                            onChange={(e) => handleUpdateEtapa(index, "valor_pago_etapa", e.target.value)}
                          />
                        </div>
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
