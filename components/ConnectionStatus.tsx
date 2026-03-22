"use client"

import { useState, useEffect } from "react"
import { checkSupabaseConnection, isConfigured } from "@/lib/supabase"
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const checkConnection = async () => {
    setIsRetrying(true)
    const result = await checkSupabaseConnection()
    if (result.success) {
      setStatus("online")
      setErrorMessage(null)
    } else {
      setStatus("offline")
      setErrorMessage(result.message || "Falha desconhecida")
    }
    setIsRetrying(false)
  }

  useEffect(() => {
    checkConnection()
    // Re-check periodically
    const interval = setInterval(checkConnection, 60000) // Every minute
    return () => clearInterval(interval)
  }, [])

  if (!isConfigured) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
        <AlertCircle className="w-3 h-3 text-amber-500" />
        <span>Modo Local (Offline)</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {status === "connecting" || isRetrying ? (
          <motion.div 
            key="connecting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider"
          >
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Verificando...</span>
          </motion.div>
        ) : status === "online" ? (
          <motion.div 
            key="online"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50/50 rounded-full border border-emerald-100/50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.1)]"
          >
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span>Sincronizado</span>
          </motion.div>
        ) : (
          <motion.div 
            key="offline"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50/50 rounded-full border border-red-100/50 text-red-600 text-[10px] font-bold uppercase tracking-wider group relative cursor-help shadow-[0_0_12px_rgba(239,68,68,0.1)]">
              <WifiOff className="w-3 h-3 text-red-500" />
              <span>Erro de Sincronia</span>
              {errorMessage && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-slate-900/95 backdrop-blur-sm text-white text-[9px] normal-case rounded-lg shadow-xl z-50">
                  {errorMessage}
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[10px] hover:bg-slate-100 rounded-lg text-slate-500 gap-1"
              onClick={checkConnection}
            >
              <RefreshCw className={cn("w-2.5 h-2.5", isRetrying && "animate-spin")} />
              Tentar Novamente
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
