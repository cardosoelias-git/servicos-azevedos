"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Save, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { HABILITACAO_SERVICOS } from "@/lib/conta-constants"
import { validarCPF } from "@/lib/validations"

interface ClienteForm {
  nome: string
  cpf: string
  renach: string
  contato: string
  servicos: string[]
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
