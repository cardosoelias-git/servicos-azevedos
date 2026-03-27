"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { VEICULO_SERVICOS } from "@/lib/conta-constants"

interface ServicoForm {
  servico_id: string
  valor: string
  status: string
  observacoes: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: ServicoForm
  onFormChange: (form: ServicoForm) => void
  onAdd: () => void
}

export default function ModalServico({ open, onOpenChange, form, onFormChange, onAdd }: Props) {
  const update = (field: keyof ServicoForm, value: string) => onFormChange({ ...form, [field]: value })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm mx-4">
        <DialogHeader><DialogTitle className="text-lg font-black">Adicionar Habilitação</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div><Label className="text-xs font-bold text-slate-500">Tipo de Habilitação *</Label>
            <Select value={form.servico_id} onValueChange={(val) => {
              const servico = VEICULO_SERVICOS.find(s => s.id === val)
              onFormChange({ ...form, servico_id: val, valor: servico?.preco_padrao.toString() || "" })
            }}>
              <SelectTrigger className="mt-1 h-11 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{VEICULO_SERVICOS.map(s => (<SelectItem key={s.id} value={s.id}>{s.nome} - R$ {s.preco_padrao}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs font-bold text-slate-500">Valor (R$)</Label>
            <Input type="number" value={form.valor} onChange={(e) => update("valor", e.target.value)} className="mt-1 h-11 rounded-xl" placeholder="0.00" /></div>
          <div><Label className="text-xs font-bold text-slate-500">Status</Label>
            <Select value={form.status} onValueChange={(val) => update("status", val)}>
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
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancelar</Button>
          <Button onClick={onAdd} className="rounded-xl font-bold bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
