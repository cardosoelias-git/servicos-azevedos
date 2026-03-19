"use client"

import { Moon, Sun } from "lucide-react"
import { useSafeTheme } from "@/hooks/useTheme"
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect } from "react"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useSafeTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group overflow-hidden"
      aria-label="Alternar tema"
    >
      <AnimatePresence mode="wait">
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-600 dark:text-slate-400 group-hover:text-orange-500 dark:group-hover:text-orange-400"
          >
            <Sun className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-400 group-hover:text-orange-400"
          >
            <Moon className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
