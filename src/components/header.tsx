"use client";

import React, { useState, useRef, useEffect } from "react";
import GlobalNotificationBell from "./GlobalNotificationBell";


type HeaderProps = {
  userName?: string;
};

export default function Header({ userName }: HeaderProps) {
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
    <header className="hidden sm:flex h-16 items-center justify-between px-8 border-b bg-transparent">
      <div className="font-semibold text-lg ml-16 sm:ml-20">
      </div>
      <div className="flex items-center gap-4 relative">
        {/* Sino de Notificações Globais */}
        <GlobalNotificationBell />
        
        {/* Botão só mostra avatar no mobile, nome/avatar no desktop */}
        <button
          className="flex items-center gap-2 focus:outline-none group hover:cursor-pointer"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="text-sm text-gray-500 transition-colors hover:cursor-pointer group-hover:text-[#003153]">
            {isClient && userName ? userName : 'Usuário'}
          </span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold border hover:cursor-pointer" 
               style={{ 
                 backgroundColor: '#003153', 
                 color: 'white',
                 borderColor: '#003153'
               }}>
            {initials}
          </div>
        </button>
        {menuOpen && (
          <div ref={menuRef} className="absolute right-0 top-12 mt-2 w-72 max-w-[90vw] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 animate-fade-in">
            <ul className="py-2">
              <li>
                <a href="/configuracoes" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:cursor-pointer hover:bg-[#003153] hover:bg-opacity-5">Configurações</a>
              </li>
              <li>
                <a href="/ajuda" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:cursor-pointer hover:bg-[#003153] hover:bg-opacity-5">Ajuda</a>
              </li>
              <li>
                <a href="/feedback" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:cursor-pointer hover:bg-[#003153] hover:bg-opacity-5">Feedback</a>
              </li>
              <li>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:cursor-pointer hover:bg-[#003153] hover:bg-opacity-5">Sair</button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
