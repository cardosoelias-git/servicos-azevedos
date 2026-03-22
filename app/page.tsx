"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, DollarSign, Users, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, TrendingUp, FileText, Shield, Truck, Star, Award, FileCheck, IdCard } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { getStorageData } from "@/lib/storage"
import { useRealtime } from "@/hooks/useRealtime"

export default function Dashboard() {
  const { data: servicos, loading: loadingServicos } = useRealtime<any>("servicos")
  const { data: clientes, loading: loadingClientes } = useRealtime<any>("clientes")
  
  const [dashboardStats, setDashboardStats] = useState([
    {
      title: "Serviços Ativos",
      value: "0",
      description: "Processos em andamento",
      icon: IdCard,
      color: "text-orange-600",
      bg: "bg-orange-50",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      title: "Total de Clientes",
      value: "0",
      description: "Clientes cadastrados",
      icon: Users,
      color: "text-blue-700",
      bg: "bg-blue-50",
      gradient: "from-blue-600 to-blue-700"
    },
    {
      title: "Valores a Receber",
      value: "R$ 0,00",
      description: "De serviços ativos",
      icon: DollarSign,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      gradient: "from-emerald-600 to-emerald-700"
    }
  ])

  const [activities, setActivities] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Atualizar estatísticas sempre que os dados mudarem (Realtime)
  useEffect(() => {
    if (!mounted || loadingServicos || loadingClientes) return

    const servicosAtivos = servicos.filter((s: any) => s.status === "Em Andamento").length
    const totalReceber = servicos.reduce((acc: number, curr: any) => acc + (parseFloat(curr.valor_total || 0) - parseFloat(curr.valor_pago || 0)), 0)
    
    setDashboardStats([
      {
        title: "Serviços Ativos",
        value: servicosAtivos.toString(),
        description: "Processos em andamento",
        icon: IdCard,
        color: "text-orange-600",
        bg: "bg-orange-50",
        gradient: "from-orange-500 to-orange-600"
      },
      {
        title: "Total de Clientes",
        value: clientes.length.toString(),
        description: "Clientes cadastrados",
        icon: Users,
        color: "text-blue-700",
        bg: "bg-blue-50",
        gradient: "from-blue-600 to-blue-700"
      },
      {
        title: "Valores a Receber",
        value: `R$ ${totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        description: "De serviços ativos",
        icon: DollarSign,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        gradient: "from-emerald-600 to-emerald-700"
      }
    ])

    if (servicos.length > 0) {
      const recent = servicos.slice(0, 4).map((s: any) => ({
        id: s.id,
        user: s.cliente_nome || "Cliente", // No Supabase Realtime, dependendo da query, clientes (nome) pode ser retornado
        action: `Processo de ${s.tipo_servico}`,
        time: s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') : "Recentemente",
        status: s.status === "Concluído" ? "success" : s.status === "Cancelado" ? "warning" : "info"
      }))
      setActivities(recent)
    } else {
      setActivities([
        { id: 1, user: "Bem-vindo", action: "Comece adicionando clientes e serviços", time: "Hoje", status: "info" },
      ])
    }
  }, [servicos, clientes, mounted, loadingServicos, loadingClientes])

  if (!mounted) return null

  return (
    <div className="space-y-2.5 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:gap-1.5 relative mb-2">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900"
        >
          Seja Bem-vindo
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-xs sm:text-sm lg:text-base animate-in fade-in slide-in-from-left-4 duration-1000 delay-300"
        >
          Resumo geral da <strong>SERVICOS AZEVEDO</strong> hoje.
        </motion.p>
      </div>

      {/* Serviços H e V - Topo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4"
      >
        {/* Card Serviços H - Habilitação */}
        <Link href="/servicos?tipo=habilitacao" className="group">
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 sm:p-6 h-full min-h-[140px] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="bg-blue-50 p-2.5 sm:p-3 rounded-xl transition-colors group-hover:bg-blue-500 text-blue-600 group-hover:text-white">
                  <IdCard className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50/50 px-2.5 py-1 rounded-full border border-blue-100/50">
                  <Star className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-blue-700 text-[10px] font-bold">Popular</span>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">Serviços H</h3>
                <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
                  Habilitação: CNH, Adição e Mudança de Categoria
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-blue-600 text-xs font-semibold">
                  <span>Acessar painel</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Card Serviços V - Veículos */}
        <Link href="/servicos?tipo=veiculos" className="group">
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 sm:p-6 h-full min-h-[140px] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="bg-emerald-50 p-2.5 sm:p-3 rounded-xl transition-colors group-hover:bg-emerald-500 text-emerald-600 group-hover:text-white">
                  <Truck className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50/50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-700 text-[10px] font-bold">Novo</span>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">Serviços V</h3>
                <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
                  Transferência, Licenciamento e Vistoria
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-emerald-600 text-xs font-semibold">
                  <span>Acessar painel</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="group"
          >
            <Card className="bento-card relative overflow-hidden h-full border-slate-200">
              <div className={`absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full blur-xl sm:blur-2xl group-hover:opacity-15 transition-opacity duration-500`}></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10 p-4 sm:p-5">
                <CardTitle className="font-semibold text-slate-500 text-xs sm:text-sm">{stat.title}</CardTitle>
                <div className={cn(stat.bg, "p-2 rounded-lg transition-transform duration-300 group-hover:scale-105")}>
                  <stat.icon className={cn(stat.color, "w-4 h-4 sm:w-5 sm:h-5")} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 px-4 sm:px-5 pb-4 sm:pb-5">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {/* Activities */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="xl:col-span-2 space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">Atividades Recentes</h2>
            <Link href="/servicos" className="text-[10px] sm:text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1">
              Ver tudo <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid gap-2 sm:gap-3">
            {activities.map((activity, index) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-all duration-300 group"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300",
                  activity.status === 'success' ? 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100/50' : 
                  activity.status === 'warning' ? 'bg-amber-50 text-amber-500 group-hover:bg-amber-100/50' : 
                  'bg-orange-50 text-orange-500 group-hover:bg-orange-100/50'
                )}>
                  {activity.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
                   activity.status === 'warning' ? <AlertCircle className="w-5 h-5" /> : 
                   <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">{activity.user}</h4>
                  <p className="text-xs text-slate-500 truncate">{activity.action}</p>
                </div>
                <div className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md shrink-0 hidden xs:block">
                  {activity.time}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3 sm:space-y-4"
        >
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">Ações Rápidas</h2>
          <div className="grid gap-2.5">
            <Link href="/servicos" className="group flex items-center justify-between p-3.5 sm:p-4 bg-orange-500 text-white rounded-xl shadow-sm hover:bg-orange-600 hover:-translate-y-0.5 transition-all duration-300 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              <span className="text-sm">Novo Serviço</span>
              <div className="bg-white/20 p-2 rounded-lg transition-colors">
                <IdCard className="w-4 h-4" />
              </div>
            </Link>
            <Link href="/clientes" className="group flex items-center justify-between p-3.5 sm:p-4 bg-slate-800 text-white rounded-xl shadow-sm hover:bg-slate-900 hover:-translate-y-0.5 transition-all duration-300 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2">
              <span className="text-sm">Cadastrar Cliente</span>
              <div className="bg-white/10 p-2 rounded-lg transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </Link>
            <Link href="/financeiro" className="group flex items-center justify-between p-3.5 sm:p-4 bg-white text-slate-700 border border-slate-200 rounded-xl hover:border-orange-500/50 hover:bg-orange-50/50 hover:-translate-y-0.5 transition-all duration-300 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              <span className="text-sm">Financeiro</span>
              <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-orange-100 transition-colors">
                <DollarSign className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
              </div>
            </Link>
          </div>

          {/* Overview Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 text-slate-900 shadow-sm">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="bg-orange-500 p-1.5 rounded-lg text-white">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="font-bold text-sm sm:text-base truncate">Visão Geral</span>
            </div>
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[10px] sm:text-xs">Crescimento</span>
                <span className="font-bold text-emerald-600 text-xs sm:text-sm">+15%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 0.9, duration: 1 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                />
              </div>
              <p className="text-[10px] text-slate-400">Comparado ao mês anterior</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
