
"use client"

import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, Car, CreditCard, Settings, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-sm transition-colors duration-300">
        <div className="w-full px-3 sm:px-4 md:px-6 flex items-center justify-between h-12 sm:h-14">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-black text-sm sm:text-base shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-300">
                A
              </div>
              <span className="font-black text-sm sm:text-base md:text-lg tracking-tight hidden xs:block">
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
                      "relative flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap",
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
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <div className="h-4 sm:h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 hidden xs:block"></div>
            <button className="hidden xs:flex items-center gap-2 p-1 pl-2 sm:pl-2.5 pr-2.5 sm:pr-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200/80 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md">
              <div className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hidden md:block">Conta</span>
            </button>
            <button
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-orange-500 dark:hover:text-orange-400 rounded-xl transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/98 dark:bg-slate-950/98 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-2 sm:p-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
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

      {!isDesktop && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 safe-area-inset-bottom">
          <div className="flex items-center justify-around px-2 py-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-w-[60px]",
                    isActive
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
                  <span className="hidden sm:block text-[10px]">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col transition-colors duration-300`}>
        <HeaderContent />

        <main className="flex-1 w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 pb-20 lg:pb-5">
          <AnimatePresence mode="wait">
            <motion.div
              key="main-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="hidden lg:block border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950 py-4 sm:py-6 transition-colors duration-300">
          <div className="w-full px-4 md:px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md">
                  A
                </div>
                <span className="font-black text-sm text-slate-900 dark:text-white">SERVICOS <span className="text-orange-500">AZEVEDO</span></span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Todos os direitos reservados.
              </div>
              <div className="flex gap-4 sm:gap-6 text-xs text-slate-400 dark:text-slate-500">
                <Link href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">Privacidade</Link>
                <Link href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">Termos</Link>
                <Link href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">Suporte</Link>
              </div>
            </div>
          </div>
        </footer>

        <Toaster />
      </div>
    </ThemeProvider>
  );
}
