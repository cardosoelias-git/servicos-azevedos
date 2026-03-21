
"use client"

import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, IdCard, CreditCard, Settings, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const LOGO_URL = "https://vfbcboddmqcgzpyyscjs.supabase.co/storage/v1/object/sign/imagens_site/icone%20_azevedos.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZWViNzU4Yy0zNjYxLTQ0MTEtYmNiNS1hMGM4NmYxYTZkZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5zX3NpdGUvaWNvbmUgX2F6ZXZlZG9zLnBuZyIsImlhdCI6MTc3NDA1NjE0MiwiZXhwIjoxODA1NTkyMTQyfQ.hm3XdkycdDjF22O9X4ogC_KXyoUHO0v5TmNbUO-Dljk";
const FOOTER_LOGO_URL = "https://vfbcboddmqcgzpyyscjs.supabase.co/storage/v1/object/sign/imagens_site/logo_azevedos.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZWViNzU4Yy0zNjYxLTQ0MTEtYmNiNS1hMGM4NmYxYTZkZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5zX3NpdGUvbG9nb19hemV2ZWRvcy5wbmciLCJpYXQiOjE3NzQwNTYyNTgsImV4cCI6MTgwNTU5MjI1OH0.bofxAW2ZQtDk4X3VH62qUuIB3PTKT4YCv3_5aHEMMm0";

const inter = Inter({ subsets: ['latin'] });

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Serviços', href: '/servicos', icon: IdCard },
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
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-sm transition-all duration-300">
        <div className="w-full px-2 sm:px-4 md:px-6 flex items-center justify-between h-14 sm:h-20 lg:h-24">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
              <div className="relative w-8 h-8 xs:w-10 xs:h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 transition-transform duration-300 group-hover:scale-110 drop-shadow-xl border-2 border-white/10 rounded-full overflow-hidden bg-white/5 p-0.5">
                <Image 
                  src={LOGO_URL}
                  alt="Azevedos Logo"
                  fill
                  className="object-contain filter brightness-110 contrast-110"
                  priority
                />
              </div>
              <span className="font-black text-sm sm:text-base md:text-lg tracking-tight hidden xs:block">
                <span className="text-slate-900">SERVICOS</span> <span className="text-gradient">AZEVEDO</span>
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
                          ? "text-orange-600 bg-orange-50 shadow-sm"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", isActive ? "text-orange-500" : "text-slate-500")} />
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button className="hidden xs:flex items-center gap-2 p-1 pl-2 sm:pl-2.5 pr-2.5 sm:pr-3.5 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/80 bg-white shadow-sm hover:shadow-md">
              <div className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 hidden md:block">Conta</span>
            </button>
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 hover:text-orange-500 rounded-xl transition-all"
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
              className="lg:hidden border-t border-slate-200/50 bg-white/98 backdrop-blur-xl overflow-hidden"
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
                        ? "bg-orange-50 text-orange-600 shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/50 safe-area-inset-bottom">
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
                      ? "text-orange-600"
                      : "text-slate-500"
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
    <div className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col transition-colors duration-300`}>
      <HeaderContent />

      <main className="flex-1 w-full px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-5 pb-20 lg:pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-[1400px] mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="hidden lg:block border-t border-slate-200 bg-white py-4 sm:py-6 transition-colors duration-300">
        <div className="w-full px-4 md:px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 drop-shadow-2xl transition-transform duration-300 hover:scale-105">
                <Image 
                  src={FOOTER_LOGO_URL}
                  alt="Azevedos Logo"
                  fill
                  className="object-contain filter brightness-110 contrast-110"
                />
              </div>
              <span className="font-black text-sm sm:text-base text-slate-900">SERVICOS <span className="text-orange-500">AZEVEDO</span></span>
            </div>
            <div className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Todos os direitos reservados.
            </div>
            <div className="flex gap-4 sm:gap-6 text-xs text-slate-400">
              <Link href="#" className="hover:text-orange-500 transition-colors font-medium">Privacidade</Link>
              <Link href="#" className="hover:text-orange-500 transition-colors font-medium">Termos</Link>
              <Link href="#" className="hover:text-orange-500 transition-colors font-medium">Suporte</Link>
            </div>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
