"use client";

import React, { useState, useRef, useEffect } from "react";


type HeaderProps = {
  userName?: string;
  title?: string;
};

export default function Header({ userName, title }: HeaderProps) {
  const [isClient, setIsClient] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }

  let initials = 'U';
  if (isClient && userName) {
    initials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b bg-transparent dark:bg-transparent">
      <div className="font-semibold text-lg ml-16 sm:ml-20">
        {title || "Máquina de Vendas"}
      </div>
      <div className="flex items-center gap-4 relative">
        {/* Botão só mostra avatar no mobile, nome/avatar no desktop */}
        <button
          className="flex items-center gap-2 focus:outline-none group"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors hover:cursor-pointer">
            {isClient && userName ? userName : 'Usuário'}
          </span>
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold border border-blue-200 dark:border-blue-800 hover:cursor-pointer">
            {initials}
          </div>
        </button>
        {menuOpen && (
          <div ref={menuRef} className="absolute right-0 top-12 mt-2 w-72 max-w-[90vw] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 animate-fade-in">
            {/* Usuário no topo do menu, só no mobile */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 sm:hidden bg-blue-50 dark:bg-blue-900/40 rounded-t-lg">
              <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg">{initials}</div>
              <span className="font-semibold text-base text-blue-900 dark:text-blue-100 break-all">{isClient && userName ? userName : 'Usuário'}</span>
            </div>
            <ul className="py-2">
              <li>
                <a href="/configuracoes" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors hover:cursor-pointer">Configurações</a>
              </li>
              <li>
                <a href="/ajuda" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors hover:cursor-pointer">Ajuda</a>
              </li>
              <li>
                <a href="/feedback" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors hover:cursor-pointer">Feedback</a>
              </li>
              <li>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors hover:cursor-pointer">Sair</button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
