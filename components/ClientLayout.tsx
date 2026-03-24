"use client"

import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, IdCard, CreditCard, Settings, User, Menu, X, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ConnectionStatus } from './ConnectionStatus';

const LOGO_URL = "https://vfbcboddmqcgzpyyscjs.supabase.co/storage/v1/object/sign/imagens_site/icone%20_azevedos.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZWViNzU4Yy0zNjYxLTQ0MTEtYmNiNS1hMGM4NmYxYTZkZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5zX3NpdGUvaWNvbmUgX2F6ZXZlZG9zLnBuZyIsImlhdCI6MTc3NDA1NjE0MiwiZXhwIjoxODA1NTkyMTQyfQ.hm3XdkycdDjF22O9X4ogC_KXyoUHO0v5TmNbUO-Dljk";
const FOOTER_LOGO_URL = "https://vfbcboddmqcgzpyyscjs.supabase.co/storage/v1/object/sign/imagens_site/logo_azevedos.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZWViNzU4Yy0zNjYxLTQ0MTEtYmNiNS1hMGM4NmYxYTZkZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5zX3NpdGUvbG9nb19hemV2ZWRvcy5wbmciLCJpYXQiOjE3NzQwNTYyNTgsImV4cCI6MTgwNTU5MjI1OH0.bofxAW2ZQtDk4X3VH62qUuIB3PTKT4YCv3_5aHEMMm0";

const inter = Inter({ subsets: ['latin'] });

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Habilitação', href: '/servicos', icon: BadgeCheck },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Financeiro', href: '/financeiro', icon: CreditCard },
];

function HeaderContent({ pathname }: { pathname: string }) {
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
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/98 shadow-sm transition-all duration-200 backdrop-blur-md">
        <div className="w-full px-2 sm:px-4 md:px-6 flex items-center justify-between h-14 sm:h-20 lg:h-20">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0">
              <div className="relative w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 transition-transform duration-300 group-hover:scale-105">
                <Image 
                  src={LOGO_URL}
                  alt="Azevedos Logo"
                  fill
                  className="object-contain filter brightness-110 contrast-110 transition-all"
                  priority
                />
              </div>
              <span className="font-bold text-sm sm:text-base md:text-lg tracking-tight">
                <span className="text-slate-900">SERVICOS</span> <span className="text-orange-600">AZEVEDO</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1.5 ml-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap group/nav",
                      isActive
                        ? "text-orange-600 bg-orange-50/50 shadow-sm border border-orange-100/50"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className={cn("w-4.5 h-4.5 transition-transform duration-300 group-hover/nav:scale-110", isActive ? "text-orange-600 stroke-[2.5px]" : "text-slate-400")} />
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill-glow"
                        className="absolute -bottom-[1px] left-4 right-4 h-1 bg-orange-500 rounded-full blur-[2px] opacity-40"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="mr-2 hidden xs:block">
              <ConnectionStatus />
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-100 pl-2 sm:pl-3">
              <Link href="/conta" className="hidden xs:flex items-center gap-2 p-1 pl-2 sm:pl-2.5 pr-2.5 sm:pr-3.5 hover:bg-slate-50 rounded-lg transition-all border border-slate-200 bg-white shadow-sm hover:shadow-glow group/account">
                <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-md flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover/account:scale-110">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 hidden md:block">Conta</span>
              </Link>
              <button
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 hover:text-orange-500 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
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
                <Link
                  href="/conta"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    pathname === "/conta"
                      ? "bg-orange-50 text-orange-600 shadow-sm"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <User className="w-5 h-5" />
                  Conta
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {!isDesktop && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-slate-100 safe-area-inset-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-w-[60px]",
                    isActive
                      ? "text-orange-600"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "scale-105 stroke-[2.5px]")} />
                  <span className="hidden sm:block text-[10px]">{item.name}</span>
                </Link>
              );
            })}
            <Link
              href="/conta"
              className={cn(
                "flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-w-[60px]",
                pathname === "/conta"
                  ? "text-orange-600"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <User className={cn("w-5 h-5", pathname === "/conta" && "scale-105 stroke-[2.5px]")} />
              <span className="hidden sm:block text-[10px]">Conta</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={cn(inter.className, "bg-slate-50/50 text-foreground min-h-screen flex flex-col transition-colors duration-500 relative isolate")}>
      {/* Global Background Spotlight */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[40%] bg-blue-100/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute bottom-[10%] left-[20%] w-[35%] h-[35%] bg-emerald-100/20 rounded-full blur-[110px] animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      <HeaderContent pathname={pathname} />

      <main className="flex-1 w-full px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-5 pb-20 lg:pb-5 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname ?? "default"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
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
                  className="object-contain filter brightness-110 contrast-110 transition-all"
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
