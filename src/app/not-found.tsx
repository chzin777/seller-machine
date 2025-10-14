"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image 
            src="/images/logo-texto.png" 
            alt="Logo Única" 
            width={200}
            height={80}
            className="mx-auto h-20 w-auto object-contain"
          />
        </div>
        
        {/* 404 */}
        <h1 className="text-9xl font-bold mb-4" style={{ color: '#003153' }}>404</h1>
        
        {/* Mensagem */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Página não encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          Desculpe, não conseguimos encontrar a página que você está procurando.
        </p>
        
        {/* Botões */}
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:cursor-pointer"
            style={{ backgroundColor: '#003153' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#002d4a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#003153'}
          >
            Voltar ao Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="block w-full border-2 font-bold py-3 px-6 rounded-lg transition-colors hover:cursor-pointer"
            style={{ 
              borderColor: '#003153', 
              color: '#003153',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#003153';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#003153';
            }}
          >
            Voltar à página anterior
          </button>
        </div>
        
        {/* Links úteis */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Links úteis:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/mapa-vendas" className="hover:underline" style={{ color: '#003153' }}>
              Mapa de Vendas
            </Link>
            <Link href="/clientes" className="hover:underline" style={{ color: '#003153' }}>
              Clientes
            </Link>
            <Link href="/carteira-vendedor" className="hover:underline" style={{ color: '#003153' }}>
              Carteira de Vendedor
            </Link>
            <Link href="/ia" className="hover:underline" style={{ color: '#003153' }}>
              Inteligência Artificial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}