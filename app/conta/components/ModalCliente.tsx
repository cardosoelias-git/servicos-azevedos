"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Save, Check, Upload, FileText, Image as ImageIcon, Trash2, X, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { HABILITACAO_SERVICOS } from "@/lib/conta-constants"
import { validarCPF } from "@/lib/validations"
import { uploadFileWithFallback } from "@/lib/upload"
import type { UploadedDoc } from "@/lib/upload"

interface ClienteForm {
  nome: string
  cpf: string
  renach: string
  contato: string
  servicos: string[]
  documentos: UploadedDoc[]
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: boolean
  form: ClienteForm
  onFormChange: (form: ClienteForm) => void
  onSave: () => void
}

export default function ModalCliente({ open, onOpenChange, editing, form, onFormChange, onSave }: Props) {
  const [cpfErro, setCpfErro] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) setCpfErro("")
  }, [open])

  const update = (field: keyof ClienteForm, value: any) => {
    onFormChange({ ...form, [field]: value })
    if (field === "cpf") {
      const digits = value.replace(/\D/g, "")
      if (digits.length === 11 && !validarCPF(digits)) {
        setCpfErro("CPF inválido")
      } else {
        setCpfErro("")
      }
    }
  }

  const toggleServico = (id: string) => {
    const current = form.servicos || []
    if (current.includes(id)) {
      update("servicos", current.filter(s => s !== id))
    } else {
      update("servicos", [...current, id])
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const result = await uploadFileWithFallback(file, { folder: "clientes" })
    setUploading(false)

    if (result.success && result.doc) {
      update("documentos", [...(form.documentos || []), result.doc])
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDeleteDoc = (docId: string) => {
    update("documentos", (form.documentos || []).filter(d => d.id !== docId))
  }

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4 text-blue-500" />
    if (type === "application/pdf") return <FileText className="w-4 h-4 text-red-500" />
    return <FileText className="w-4 h-4 text-slate-500" />
  }

  const cpfDigits = form.cpf.replace(/\D/g, "")
  const hasInvalidCpf = cpfDigits.length === 11 && !validarCPF(cpfDigits)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-lg font-black">{editing ? "Editar Cliente" : "Cadastrar Cliente"}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div><Label className="text-xs font-bold text-slate-500">Nome *</Label>
            <Input value={form.nome} onChange={(e) => update("nome", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="Nome completo" /></div>
          <div>
            <Label className="text-xs font-bold text-slate-500">CPF</Label>
            <Input value={form.cpf} onChange={(e) => update("cpf", e.target.value)} className={cn("mt-1 h-11 rounded-xl", cpfErro && "border-red-400 focus-visible:ring-red-400")} placeholder="000.000.000-00" />
            {cpfErro && <p className="text-xs text-red-500 mt-1 font-semibold">{cpfErro}</p>}
          </div>
          <div><Label className="text-xs font-bold text-slate-500">RENACH</Label>
            <Input value={form.renach} onChange={(e) => update("renach", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="00000000000" /></div>
          <div><Label className="text-xs font-bold text-slate-500">Contato</Label>
            <Input value={form.contato} onChange={(e) => update("contato", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="(00) 00000-0000" /></div>
          
          <div>
            <Label className="text-xs font-bold text-slate-500 mb-2 block">Habilitações</Label>
            <div className="grid grid-cols-2 gap-2">
              {HABILITACAO_SERVICOS.map((servico) => {
                const selected = form.servicos?.includes(servico.id)
                return (
                  <button key={servico.id} type="button" onClick={() => toggleServico(servico.id)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border-2 text-left text-xs font-bold transition-all",
                      selected
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-orange-300"
                    )}>
                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center shrink-0",
                      selected ? "bg-orange-500 text-white" : "border-2 border-slate-300"
                    )}>
                      {selected && <Check className="w-3 h-3" />}
                    </div>
                    {servico.nome}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-500 mb-2 block">Documentos</Label>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="w-full h-10 rounded-xl border-dashed border-2 border-slate-300 text-slate-500 hover:border-orange-400 hover:text-orange-500">
              <Upload className="w-4 h-4 mr-2" /> {uploading ? "Enviando..." : "Adicionar documento"}
            </Button>
            {form.documentos?.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {form.documentos.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    {getFileTypeIcon(doc.type)}
                    <span className="text-xs font-medium text-slate-700 flex-1 truncate">{doc.name}</span>
                    {doc.url && !doc.url.startsWith("data:") && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500">
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button onClick={() => handleDeleteDoc(doc.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancelar</Button>
          <Button onClick={onSave} disabled={hasInvalidCpf} className={cn("rounded-xl font-bold", hasInvalidCpf ? "bg-slate-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600")}>
            <Save className="w-4 h-4 mr-2" /> {editing ? "Atualizar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
