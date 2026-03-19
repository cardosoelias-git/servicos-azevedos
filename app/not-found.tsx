import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-orange-500/30">
            A
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl font-black text-slate-900 dark:text-white tracking-tight">
            404
          </h1>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            Página Não Encontrada
          </h2>
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-lg">
          A página que você está procurando não existe ou foi movida. 
          Volte para a página inicial para continuar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-orange-500/30">
              <Home className="mr-2 h-5 w-5" />
              Voltar ao Início
            </Button>
          </Link>
          <Link href="/servicos">
            <Button variant="outline" className="w-full sm:w-auto border-2 border-slate-200 dark:border-slate-700 font-bold px-8 py-6 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
              <Car className="mr-2 h-5 w-5" />
              Ver Serviços
            </Button>
          </Link>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Se você acredita que isso é um erro, entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
