"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, DollarSign, Users, User, ArrowUpRight, ArrowDownRight, TrendingUp, FileText, Shield, Truck, Star, Award, FileCheck, Plus, BadgeCheck, IdCard } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { getStorageData } from "@/lib/storage"
import { useRealtime } from "@/hooks/useRealtime"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const DASHBOARD_LOGO_URL = "https://vfbcboddmqcgzpyyscjs.supabase.co/storage/v1/object/sign/imagens_site/logo_azevedos.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZWViNzU4Yy0zNjYxLTQ0MTEtYmNiNS1hMGM4NmYxYTZkZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5zX3NpdGUvbG9nb19hemV2ZWRvcy5wbmciLCJpYXQiOjE3NzQxNDQzNDIsImV4cCI6MTgwNTY4MDM0Mn0.OsaN0CzHn_bEC-_d1_yvLABS5gjBxQ6pAoNu3JKlk5U";

export default function Dashboard() {
  const { data: servicosGerais, loading: loadingServicos } = useRealtime<any>("servicos", [], { column: 'contexto', value: 'geral' })
  const { data: clientesGerais, loading: loadingClientes } = useRealtime<any>("clientes", [], { column: 'contexto', value: 'geral' })
  const { data: transacoesGerais, loading: loadingTransacoes } = useRealtime<any>("transacoes", [], { column: 'contexto', value: 'geral' })
  
  const [dashboardStats, setDashboardStats] = useState([
    {
      title: "Serviços Ativos",
      value: "0",
      description: "Processos em andamento",
      icon: BadgeCheck,
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

  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Atualizar estatísticas sempre que os dados mudarem (Realtime)
  useEffect(() => {
    if (!mounted || loadingServicos || loadingClientes) return

    const hAtivas = servicosGerais.filter((s: any) => s.status === "Em Andamento").length
    const totalClientes = clientesGerais.length
    
    // Cálculo de valores a receber baseado nos serviços
    const totalReceberServicos = servicosGerais.reduce((acc: number, curr: any) => acc + (parseFloat(curr.valor_total || 0) - parseFloat(curr.valor_pago || 0)), 0)
    
    // Podemos também calcular o total recebido hoje via transações para dar um feedback visual de movimento
    const hoje = new Date().toISOString().split('T')[0]
    const totalRecebidoHoje = transacoesGerais
      .filter((t: any) => t.data === hoje && t.tipo === 'Entrada' && t.status === 'Pago')
      .reduce((acc: number, curr: any) => acc + parseFloat(curr.valor || 0), 0)
    
    setDashboardStats([
      {
        title: "Serviços Ativos",
        value: hAtivas.toString(),
        description: "Processos em andamento",
        icon: BadgeCheck,
        color: "text-orange-600",
        bg: "bg-orange-50",
        gradient: "from-orange-500 to-orange-600"
      },
      {
        title: "Total de Clientes",
        value: totalClientes.toString(),
        description: "Clientes cadastrados",
        icon: Users,
        color: "text-blue-700",
        bg: "bg-blue-50",
        gradient: "from-blue-600 to-blue-700"
      },
      {
        title: "Valores a Receber",
        value: `R$ ${totalReceberServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        description: totalRecebidoHoje > 0 
          ? `+ R$ ${totalRecebidoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} recebidos hoje` 
          : "De serviços ativos",
        icon: DollarSign,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        gradient: "from-emerald-600 to-emerald-700"
      }
    ])

    const allServicos = servicosGerais
    if (allServicos.length > 0) {
      // Sort by updated_at or created_at if possible, otherwise just take latest
    }
  }, [servicosGerais, clientesGerais, transacoesGerais, mounted, loadingServicos, loadingClientes, loadingTransacoes])

  if (!mounted) {
    return (
      <div className="space-y-4 lg:space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-lg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-32 bg-slate-100 rounded-2xl" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-50 rounded-xl" />
          <div className="h-24 bg-slate-50 rounded-xl" />
          <div className="h-24 bg-slate-50 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative mb-8 pl-4 sm:pl-6">
        <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-glow-hover"></div>
        <motion.h1 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 leading-none"
        >
          Seja Bem-vindo<span className="text-orange-600">.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="text-slate-500 text-sm sm:text-base lg:text-lg font-medium max-w-2xl"
        >
          Sua central de <span className="text-slate-900 font-bold">Gestão Inteligente</span>. Acompanhe seus serviços e clientes com precisão.
        </motion.p>
      </div>

      {/* Serviços H e V - Topo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 gap-2 sm:gap-4"
      >
        {/* Card Serviços H - Habilitação */}

        {/* Card Serviços H - Habilitação */}
        <Link href="/servicos" className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-500"></div>
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 sm:p-6 h-full min-h-[140px] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="bg-orange-50 p-2.5 sm:p-3 rounded-xl transition-colors group-hover:bg-orange-500 text-orange-600 group-hover:text-white">
                  <IdCard className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="flex items-center gap-1.5 bg-orange-50/50 px-2.5 py-1 rounded-full border border-orange-100/50">
                  <Award className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-orange-700 text-[10px] font-bold">Gestão</span>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">Habilitação</h3>
                <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
                  Gestão completa de processos e condutores
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-orange-600 text-xs font-semibold">
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.1 }}
            className="group"
          >
            <Card className="bento-card relative overflow-hidden h-full border-slate-200">
              <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl sm:blur-3xl group-hover:opacity-20 transition-opacity duration-500`}></div>
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 space-y-3 sm:space-y-4 order-2 xl:order-1"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
            className="hidden xl:flex items-center justify-center py-10 pointer-events-none select-none overflow-hidden"
          >
            <div className="relative w-72 h-72 lg:w-96 lg:h-96 drop-shadow-2xl">
              <Image 
                src={DASHBOARD_LOGO_URL}
                alt="Azevedos Logo Desktop"
                fill
                className="object-contain transition-all duration-700"
                priority
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3 sm:space-y-4 order-1 xl:order-2"
        >
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">Ações Rápidas</h2>
          <div className="grid gap-3">
            <Button asChild variant="premium" className="h-auto p-0 border-none shadow-none hover:shadow-none hover:scale-100 ring-0 focus-visible:ring-0 justify-between overflow-hidden">
              <Link href="/servicos" className="flex items-center justify-between w-full p-4 px-5 rounded-xl">
                <span className="text-sm font-bold uppercase tracking-wider text-white">Novo Serviço</span>
                <div className="bg-white/20 p-2 rounded-full transition-colors shadow-sm shrink-0 ml-4">
                  <BadgeCheck className="w-4 h-4 text-white shadow-glow" />
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="dark" className="h-auto p-0 border-none shadow-sm hover:shadow-md hover:scale-100 ring-0 focus-visible:ring-0 justify-between">
              <Link href="/clientes" className="flex items-center justify-between w-full p-4 px-5 rounded-xl">
                <span className="text-sm font-bold uppercase tracking-wider text-white">Cadastrar Cliente</span>
                <div className="bg-white/10 p-2 rounded-full transition-colors shadow-sm shrink-0 ml-4">
                  <User className="w-4 h-4 text-white" />
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-0 border-2 border-slate-200 hover:border-orange-500/50 hover:bg-orange-50/50 hover:scale-100 ring-0 focus-visible:ring-0 justify-between">
              <Link href="/financeiro" className="flex items-center justify-between w-full p-4 px-5 rounded-xl group">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-700 transition-colors group-hover:text-orange-600">Financeiro</span>
                <div className="bg-slate-50 p-2 rounded-full group-hover:bg-orange-100 transition-colors shadow-sm shrink-0 ml-4">
                  <DollarSign className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
                </div>
              </Link>
            </Button>
          </div>

          {/* Overview Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="bg-orange-500 p-1.5 rounded-lg text-white">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="font-bold text-sm sm:text-base truncate text-slate-900">Visão Geral</span>
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

      {/* Logo at the bottom - Well visible especially on mobile (Hidden on Desktop as requested) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
        className="xl:hidden flex items-center justify-center py-10 sm:py-14 pointer-events-none select-none overflow-hidden"
      >
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 drop-shadow-2xl">
          <Image 
            src={DASHBOARD_LOGO_URL}
            alt="Azevedos Logo Mobile Footer"
            fill
            className="object-contain transition-all duration-700"
            priority
          />
        </div>
      </motion.div>
    </div>
  )
}
