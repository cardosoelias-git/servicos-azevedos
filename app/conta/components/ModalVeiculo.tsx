"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Save } from "lucide-react"

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
  const update = (field: keyof VeiculoForm, value: any) => onFormChange({ ...form, [field]: value })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm mx-4">
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
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancelar</Button>
          <Button onClick={onSave} className="rounded-xl font-bold bg-orange-500 hover:bg-orange-600">
            <Save className="w-4 h-4 mr-2" /> Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
