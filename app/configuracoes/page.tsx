"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Shield, Database, Save, Moon, Sun, Download, Upload, Trash2, AlertTriangle } from "lucide-react"
import { motion } from "motion/react"
import { getStorageData } from "@/lib/storage"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "@/hooks/useTheme"

interface Configuracoes {
  nome: string
  email: string
  modoEscuro: boolean
  notificacoesEmail: boolean
  backupAutomatico: boolean
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Configuracoes>({
    nome: "Admin",
    email: "admin@servicosazevedo.com",
    modoEscuro: false,
    notificacoesEmail: true,
    backupAutomatico: true
  })
  const [salvando, setSalvando] = useState(false)
  const [tabAtiva, setTabAtiva] = useState("perfil")
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("azevedo_configuracoes")
      if (data) {
        try {
          const configSalva = JSON.parse(data)
          if (configSalva && Object.keys(configSalva).length > 0) {
            setConfig(configSalva)
            if (configSalva.modoEscuro !== undefined) {
              setTheme(configSalva.modoEscuro ? "dark" : "light")
            }
          }
        } catch (e) {}
      }
    }
  }, [setTheme])

  const handleSalvar = async () => {
    setSalvando(true)
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("azevedo_configuracoes", JSON.stringify(config))
      }
      setTheme(config.modoEscuro ? "dark" : "light")
      await new Promise(resolve => setTimeout(resolve, 500))
      toast({
        title: "Sucesso",
        description: "✅ Configurações salvas com sucesso!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "❌ Erro ao salvar configurações.",
      })
    } finally {
      setSalvando(false)
    }
  }

  const handleToggleDarkMode = (checked: boolean) => {
    setConfig({ ...config, modoEscuro: checked })
    setTheme(checked ? "dark" : "light")
  }

  const handleExportarDados = () => {
    const dados = {
      clientes: getStorageData("clientes", []),
      servicos: getStorageData("servicos", []),
      transacoes: getStorageData("transacoes", []),
      configuracoes: (() => {
        const data = localStorage.getItem("azevedo_configuracoes")
        return data ? JSON.parse(data) : {}
      })(),
      dataExportacao: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `backup_azevedo_${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Sucesso",
      description: "✅ Dados exportados com sucesso!",
    })
  }

  const handleLimparDados = () => {
    if (confirm("⚠️ Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.")) {
      localStorage.removeItem("azevedo_clientes")
      localStorage.removeItem("azevedo_servicos")
      localStorage.removeItem("azevedo_transacoes")
      localStorage.removeItem("azevedo_configuracoes")
      
      toast({
        title: "Dados apagados",
        description: "✅ Todos os dados foram removidos.",
      })
      
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const tabs = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "seguranca", label: "Segurança", icon: Shield },
    { id: "dados", label: "Backup e Dados", icon: Database },
  ]

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base lg:text-lg">Gerencie as preferências do sistema e sua conta.</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 md:gap-8">
        <nav className="lg:col-span-1">
          <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-1 bg-card rounded-xl p-1.5 lg:flex-col lg:p-2 border border-border shadow-sm transition-theme -mx-4 px-4 lg:mx-0 lg:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabAtiva(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all shrink-0 lg:w-full ${
                  tabAtiva === tab.id 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.id === "perfil" ? "Perfil" : tab.id === "notificacoes" ? "Alertas" : tab.id === "seguranca" ? "Seg." : "Dados"}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="lg:col-span-3 space-y-6 md:space-y-8">
          {tabAtiva === "perfil" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bento-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Informações do Perfil</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Atualize seu nome e e-mail.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-semibold text-slate-700 dark:text-slate-300">Nome Completo</Label>
                      <Input 
                        id="name" 
                        className="rounded-xl h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" 
                        value={config.nome}
                        onChange={(e) => setConfig({ ...config, nome: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-300">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email"
                        className="rounded-xl h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" 
                        value={config.email}
                        onChange={(e) => setConfig({ ...config, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSalvar} 
                      disabled={salvando}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl h-12 px-8 font-bold"
                    >
                      {salvando ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {tabAtiva === "notificacoes" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bento-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Preferências de Notificação</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Configure como deseja receber alertas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-theme">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold text-slate-900 dark:text-white">Notificações por E-mail</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Receber alertas de novos serviços e pagamentos.</p>
                    </div>
                    <Switch 
                      checked={config.notificacoesEmail}
                      onCheckedChange={(checked) => setConfig({ ...config, notificacoesEmail: checked })}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSalvar} 
                      disabled={salvando}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl h-12 px-8 font-bold"
                    >
                      {salvando ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {tabAtiva === "seguranca" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bento-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Preferências de Segurança</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Configure o modo escuro e outras opções.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-theme">
                    <div className="flex items-center gap-3">
                      {config.modoEscuro ? <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                      <div className="space-y-0.5">
                        <Label className="text-base font-bold text-slate-900 dark:text-white">Modo Escuro</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Alternar entre tema claro e escuro.</p>
                      </div>
                    </div>
                    <Switch 
                      checked={theme === "dark"}
                      onCheckedChange={handleToggleDarkMode}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSalvar} 
                      disabled={salvando}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl h-12 px-8 font-bold"
                    >
                      {salvando ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {tabAtiva === "dados" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bento-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Backup e Dados</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Gerencie seus dados e backups.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-theme">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div className="space-y-0.5">
                        <Label className="text-base font-bold text-slate-900 dark:text-white">Backup Automático</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Realizar backup diário dos dados.</p>
                      </div>
                    </div>
                    <Switch 
                      checked={config.backupAutomatico}
                      onCheckedChange={(checked) => setConfig({ ...config, backupAutomatico: checked })}
                    />
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Ações de Dados</h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        variant="outline"
                        onClick={handleExportarDados}
                        className="rounded-xl h-12 font-bold flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <Download className="mr-2 h-4 w-4" /> Exportar Dados (JSON)
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="rounded-xl h-12 font-bold flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <Upload className="mr-2 h-4 w-4" /> Importar Dados
                      </Button>
                    </div>

                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-bold text-red-700 dark:text-red-400">Zona de Perigo</h4>
                          <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                            Esta ação é irreversível. Todos os dados serão permanentemente removidos.
                          </p>
                          <Button 
                            variant="destructive"
                            onClick={handleLimparDados}
                            className="mt-3 bg-red-600 hover:bg-red-700 rounded-xl h-10 font-bold"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Apagar Todos os Dados
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSalvar} 
                      disabled={salvando}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl h-12 px-8 font-bold"
                    >
                      {salvando ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
