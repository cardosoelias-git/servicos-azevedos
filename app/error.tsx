"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/30">
            <AlertTriangle className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-slate-900 tracking-tight">
            Ops!
          </h1>
          <h2 className="text-2xl font-bold text-slate-700">
            Algo deu errado
          </h2>
        </div>

        <p className="text-slate-500 text-lg">
          Estamos enfrentando alguns problemas técnicos. 
          Por favor, tente novamente em alguns minutos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-orange-500/30">
              <Home className="mr-2 h-5 w-5" />
              Voltar ao Início
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto border-2 border-slate-200 font-bold px-8 py-6 rounded-xl hover:bg-slate-50"
            onClick={() => reset()}
          >
            Tentar Novamente
          </Button>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-400">
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
