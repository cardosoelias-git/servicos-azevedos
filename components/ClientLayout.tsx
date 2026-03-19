"use client"

import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, Car, CreditCard, Settings, Bell, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '@/hooks/useTheme';

const inter = Inter({ subsets: ['latin'] });

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Serviços', href: '/servicos', icon: Car },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Financeiro', href: '/financeiro', icon: CreditCard },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

function HeaderContent() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-sm transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-300">
              A
            </div>
            <span className="font-black text-xl tracking-tight hidden sm:block">
              <span className="text-slate-900 dark:text-white">SERVICOS</span> <span className="text-gradient">AZEVEDO</span>
            </span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                    isActive 
                      ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-orange-500 dark:text-orange-400" : "text-slate-400 dark:text-slate-500")} />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-orange-500 dark:hover:text-orange-400 rounded-xl transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
          <button className="flex items-center gap-2.5 p-1.5 pl-3 pr-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-200/80 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Admin</span>
          </button>
          <button 
            className="lg:hidden p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-orange-500 dark:hover:text-orange-400 rounded-xl transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/98 dark:bg-slate-950/98 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all",
                    pathname === item.href 
                      ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-500/20 dark:to-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <body className={`${inter.className} bg-white dark:bg-slate-950 min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300`} suppressHydrationWarning>
        <HeaderContent />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="main-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950 py-8 transition-colors duration-300">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">
                A
              </div>
              <span className="font-black text-slate-900 dark:text-white">SERVICOS <span className="text-orange-500">AZEVEDO</span></span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} Todos os direitos reservados.
            </div>
            <div className="flex gap-6 text-sm text-slate-400 dark:text-slate-500">
              <Link href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">Privacidade</Link>
              <Link href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">Termos</Link>
              <Link href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">Suporte</Link>
            </div>
          </div>
        </footer>
        
        <Toaster />
      </body>
    </ThemeProvider>
  );
}
