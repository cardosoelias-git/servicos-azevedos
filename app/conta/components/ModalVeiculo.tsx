"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Save, Upload, FileText, Image as ImageIcon, Trash2, Eye } from "lucide-react"
import { uploadFileWithFallback } from "@/lib/upload"
import type { UploadedDoc } from "@/lib/upload"

interface VeiculoForm {
  cliente_nome: string
  placa: string
  modelo: string
  ano: string
  renavam: string
  crv: string
  cpf: string
  contato: string
  servicos: any[]
  documentos: UploadedDoc[]
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: boolean
  form: VeiculoForm
  onFormChange: (form: VeiculoForm) => void
  onSave: () => void
}

export default function ModalVeiculo({ open, onOpenChange, editing, form, onFormChange, onSave }: Props) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update = (field: keyof VeiculoForm, value: any) => onFormChange({ ...form, [field]: value })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const result = await uploadFileWithFallback(file, { folder: "veiculos" })
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-lg font-black">{editing ? "Editar Veículo" : "Novo Veículo"}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div><Label className="text-xs font-bold text-slate-500">Nome do Cliente *</Label>
            <Input value={form.cliente_nome} onChange={(e) => update("cliente_nome", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="Nome completo" /></div>
          <div><Label className="text-xs font-bold text-slate-500">Placa *</Label>
            <Input value={form.placa} onChange={(e) => update("placa", e.target.value.toUpperCase())} className="mt-1 h-11 rounded-xl" placeholder="ABC1D23" /></div>
          <div><Label className="text-xs font-bold text-slate-500">Modelo</Label>
            <Input value={form.modelo} onChange={(e) => update("modelo", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="Fiat Uno" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-bold text-slate-500">Ano</Label>
              <Input value={form.ano} onChange={(e) => update("ano", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="2020" /></div>
            <div><Label className="text-xs font-bold text-slate-500">RENAVAM</Label>
              <Input value={form.renavam} onChange={(e) => update("renavam", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="00000000000" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-bold text-slate-500">CRV</Label>
              <Input value={form.crv} onChange={(e) => update("crv", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="00000000000" /></div>
            <div><Label className="text-xs font-bold text-slate-500">CPF</Label>
              <Input value={form.cpf} onChange={(e) => update("cpf", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="000.000.000-00" /></div>
          </div>
          <div><Label className="text-xs font-bold text-slate-500">Contato</Label>
            <Input value={form.contato} onChange={(e) => update("contato", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="(00) 00000-0000" /></div>

          <div>
            <Label className="text-xs font-bold text-slate-500 mb-2 block">Documentos do Veículo</Label>
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
          <Button onClick={onSave} className="rounded-xl font-bold bg-orange-500 hover:bg-orange-600">
            <Save className="w-4 h-4 mr-2" /> {editing ? "Atualizar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
