"use client";

import Header from "../components/header";
import Logo from "../../components/Logo";
import ThemeToggle from "../components/theme-toggle";
import { LayoutDashboard, Link2, Users, Menu, UserCog, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import "./globals.css";
import { useRouter, usePathname } from "next/navigation";


function getNavLinks(userConta?: string) {
	const baseLinks = [
		{ type: "toggle", label: "Menu", icon: Menu },
		{ href: "/", label: "Dashboard", icon: LayoutDashboard },
		{ href: "/associacoes", label: "Associações", icon: Link2 },
		{ href: "/clientes", label: "Clientes", icon: Users },
	];
	if (userConta === "Admin") {
		baseLinks.push({ href: "/usuarios", label: "Usuários", icon: UserCog });
	}
	return baseLinks;
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
	// Garante que userName e userConta sejam sempre lidos do storage
	useEffect(() => {
		if (typeof window !== "undefined") {
			let user = localStorage.getItem("user");
			if (!user) user = sessionStorage.getItem("user");
			if (user) {
				try {
					const parsed = JSON.parse(user);
					setUserName(parsed.nome ? String(parsed.nome) : undefined);
					setUserConta(parsed.conta ? String(parsed.conta) : undefined);
				} catch {
					setUserName(undefined);
					setUserConta(undefined);
				}
			} else {
				setUserName(undefined);
				setUserConta(undefined);
			}
		}
	}, []);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const pathname = usePathname();
	const [userName, setUserName] = useState<string | undefined>(undefined);
	const [userConta, setUserConta] = useState<string | undefined>(undefined);
	const [isClient, setIsClient] = useState(false);
	const isLoginPage = pathname === "/login";

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<html
			lang="pt-BR"
			suppressHydrationWarning
			className="w-full h-full min-h-screen"
		>
			<head>
				<meta name="color-scheme" content="dark light" />
				<Script id="theme-init" strategy="beforeInteractive">
					{`
						(function() {
							try {
								const theme = localStorage.getItem('theme');
								const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
								if (isDark) {
									document.documentElement.classList.add('dark');
									if (document.body) document.body.style.background = '#111827';
								} else {
									document.documentElement.classList.remove('dark');
									if (document.body) document.body.style.background = '#f9fafb';
								}
							} catch(e) {}
						})();
					`}
				</Script>
			</head>
			<body className="bg-gray-50 text-gray-900 min-h-screen w-full h-full m-0 p-0 dark:bg-gray-900 dark:text-gray-100 font-sans">
				   <div className="flex min-h-screen w-full">
					   {/* Sidebar Desktop - UI Profissional */}
					   {!isLoginPage && (
						   <aside
							   ref={sidebarRef}
							   className={`hidden sm:flex fixed left-0 top-0 h-screen transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}
								   bg-white dark:bg-gray-950 border-r border-blue-100 dark:border-gray-800 flex-col py-6 px-2 shadow-xl z-40`}
							   aria-label="Menu lateral"
							   style={{
								   boxShadow: sidebarOpen ? "4px 0 32px 0 rgba(0,0,0,0.13)" : undefined,
								   height: '100vh',
								   maxHeight: '100vh',
							   }}
						   >
							   {/* Barra de destaque */}
							   <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-700 rounded-r-lg" style={{ opacity: 0.85 }} />
							   {/* Logo e avatar */}
							   <div className="flex flex-col items-center gap-6 mb-10 relative">
								   <div className="flex items-center justify-center w-full">
									   <Logo
										   className={`block transition-all duration-300 mx-auto text-[#1e293b] dark:text-white ${sidebarOpen ? "scale-100" : "scale-90"}`}
										   width={sidebarOpen ? 140 : 36}
										   height={sidebarOpen ? 48 : 36}
										   style={{ height: sidebarOpen ? 48 : 36, maxWidth: sidebarOpen ? 140 : 36, marginBottom: 0 }}
										   aria-label="Logo Máquina de Vendas"
									   />
								   </div>
							   </div>
							   {/* Navegação principal */}
							   <nav className="flex flex-col gap-1 mt-2">
								   {getNavLinks(userConta).map((link) => {
									   const Icon = link.icon;
									   if (link.type === "toggle") {
										   return (
											   <button
												   key={"toggle-menu"}
												   type="button"
												   onClick={() => setSidebarOpen((v) => !v)}
												   className="flex items-center justify-center w-full h-12 rounded-lg transition-colors bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:cursor-pointer"
												   aria-label="Alternar menu lateral"
											   >
												   <span className="mx-auto flex items-center justify-center"><Icon className="w-6 h-6" /></span>
											   </button>
										   );
									   }
									   let isActive = false;
									   if (link.href) {
										   if (link.href === "/") {
											   isActive = pathname === "/";
										   } else {
											   isActive = pathname === link.href || pathname.startsWith(link.href + "/");
										   }
									   }
									   return (
										   <a
											   key={link.href}
											   href={link.href}
											   className={`group flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-all duration-200 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-200 text-blue-900 dark:text-blue-200 ${isActive ? "bg-blue-700 text-white font-semibold shadow-lg" : ""} pl-5`}
											   style={isActive ? { boxShadow: "0 2px 16px 0 rgba(29,78,216,0.15)" } : {}}
											   aria-current={isActive ? "page" : undefined}
										   >
											   <Icon className="w-5 h-5 flex-shrink-0" />
											   <span className={`transition-all duration-300 origin-left ${sidebarOpen ? "opacity-100 ml-2 scale-x-100" : "opacity-0 ml-0 scale-x-0 w-0"}`} style={{ width: sidebarOpen ? "auto" : 0, overflow: "hidden", whiteSpace: "nowrap" }}>{link.label}</span>
										   </a>
									   );
								   })}
							   </nav>
							   {/* Divider */}
							   {/* Divider */}
							   <div className="my-4 border-t border-blue-200 dark:border-blue-800" />
						   </aside>
					   )}

					{/* Menu Mobile */}
					{!isLoginPage && (
						<div className="sm:hidden fixed top-0 left-0 w-full z-50">
							<div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-2 py-2 shadow-md">
								<button
									className="flex items-center gap-2 text-blue-700 dark:text-blue-200 focus:outline-none hover:cursor-pointer"
									onClick={() => setSidebarOpen((v) => !v)}
									aria-label="Abrir menu"
									type="button"
								>
									<Menu className="w-7 h-7" />
								</button>
								<Logo
									className="block mx-auto text-[#1e293b] dark:text-white"
									width={120}
									height={48}
									style={{ height: 48, maxWidth: 120 }}
									aria-label="Logo Máquina de Vendas"
								/>
								<div className="w-7 h-7" /> {/* Espaço para alinhar */}
							</div>
							{sidebarOpen && (
								<div className="absolute left-2 right-2 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-blue-100 dark:border-gray-800 flex flex-col py-2 px-2 animate-fade-in z-50">
									<button
										className="absolute top-2 right-2 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-2xl font-bold"
										onClick={() => setSidebarOpen(false)}
										aria-label="Fechar menu"
										type="button"
									>
										<X className="w-6 h-6" />
									</button>
									{/* Bloco do usuário no topo do menu lateral mobile */}
									<div className="flex items-center gap-3 px-4 py-3 border-b border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/40 rounded-t-lg mb-2">
										<div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg">
											{userName ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
										</div>
										<span className="font-semibold text-base text-blue-900 dark:text-blue-100 break-all">{userName || 'Usuário'}</span>
									</div>
									{/* Links de navegação principais */}
									{getNavLinks(userConta)
										.filter((link) => link.type !== "toggle")
										.map((link) => {
											const Icon = link.icon;
											let isActive = false;
											if (link.href) {
												if (link.href === "/") {
													isActive = pathname === "/";
												} else {
													isActive =
														pathname === link.href ||
														pathname.startsWith(link.href + "/");
												}
											}
											return (
												<a
													key={link.href}
													href={link.href}
													className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors hover:bg-blue-700/10 hover:text-blue-700 text-blue-700 dark:text-blue-200 ${isActive ? "bg-blue-700 text-white font-semibold shadow" : ""
														}`}
													style={
														isActive
															? { boxShadow: "0 2px 16px 0 rgba(29,78,216,0.15)" }
															: {}
													}
													aria-current={isActive ? "page" : undefined}
													onClick={() => setSidebarOpen(false)}
												>
													<Icon className="w-5 h-5" />
													<span>{link.label}</span>
												</a>
											);
										})}
									{/* Opções extras do usuário */}
									<div className="mt-2 border-t border-blue-100 dark:border-blue-800 pt-2 flex flex-col gap-1">
										<a href="/configuracoes" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 rounded hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors hover:cursor-pointer" onClick={() => setSidebarOpen(false)}>Configurações</a>
										<a href="/ajuda" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 rounded hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors hover:cursor-pointer" onClick={() => setSidebarOpen(false)}>Ajuda</a>
										<a href="/feedback" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 rounded hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors hover:cursor-pointer" onClick={() => setSidebarOpen(false)}>Feedback</a>
										<button onClick={() => { localStorage.removeItem('user'); window.location.href = '/login'; }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 rounded hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors hover:cursor-pointer">Sair</button>
									</div>
								</div>
							)}
						</div>
					)}
					{/* Main content */}
					<div
						className={`flex-1 flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 w-full transition-all duration-300
									${!isLoginPage ? (sidebarOpen ? 'sm:pl-64' : 'sm:pl-16') : ''}`}
					>
						{/* Header fixo no topo do conteúdo, exceto na página de login */}
						{!isLoginPage && isClient && (
							   <Header userName={userName} />
						)}
						<main
							className={`flex-1 overflow-y-auto ${isLoginPage ? "p-0 bg-transparent" : "p-2 sm:p-6 md:p-8 bg-transparent"
								}`}
							style={isLoginPage ? { background: "transparent" } : {}}
						>
							{children}
						</main>
						{/* Rodapé "quieto" no fim da tela, fora do login */}
						{!isLoginPage && (
							<footer className="w-full text-center text-xs text-blue-900 dark:text-blue-200 bg-transparent py-2 select-none">
								© 2025 Máquina de Vendas
							</footer>
						)}
					</div>
				</div>
				<div
					className={`fixed bottom-6 right-6 z-50 ${isLoginPage ? "hidden" : ""}`}
				>
					<ThemeToggle />
				</div>
			</body>
		</html>
	);
}


