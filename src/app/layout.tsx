"use client";

import Header from "../components/header";
import Logo from "../../components/Logo";
import { LoadingProvider, useLoading } from "../components/LoadingContext";
import { DataProvider } from "../components/DataProvider";
import { ServiceWorkerProvider } from "../components/ServiceWorkerProvider";
import { PerformanceMonitor } from "../components/PerformanceMonitor";
import ProgressBar from "../components/ui/progress-bar";
import { LayoutDashboard, Link2, Users, Menu, UserCog, X, Map, BarChart3 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import "./globals.css";
import { useRouter, usePathname } from "next/navigation";


function getNavLinks(userConta?: string) {
	const baseLinks = [
		{ type: "toggle", label: "Menu", icon: Menu },
		{ href: "/", label: "Dashboard", icon: LayoutDashboard },
		{ href: "/mapa-vendas", label: "Mapa de Vendas", icon: Map },
		{ href: "/configurar-rfv", label: "Configurar RFV", icon: BarChart3 },
	];
	if (userConta === "Admin") {
		baseLinks.push({ href: "/usuarios", label: "Usuários", icon: UserCog });
	}
	return baseLinks;
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="pt-BR"
			suppressHydrationWarning
			className="w-full h-full min-h-screen dark"
		>
			<head>
				   <meta name="color-scheme" content="light" />
			</head>
			   <body className="bg-white text-gray-900 min-h-screen w-full h-full m-0 p-0 font-sans overflow-x-hidden"
				   style={{ background: '#fff' }}>
				<ServiceWorkerProvider>
					<LoadingProvider>
						<DataProvider>
							<LayoutContent>{children}</LayoutContent>
							<PerformanceMonitor />
						</DataProvider>
					</LoadingProvider>
				</ServiceWorkerProvider>
			</body>
		</html>
	);
}

function LayoutContent({ children }: { children: React.ReactNode }) {
	const { isLoading, progress } = useLoading();
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
		<>
			{/* Progress Bar Global */}
			<ProgressBar isLoading={isLoading} progress={progress} />
			
			<div className="flex min-h-screen w-full relative overflow-x-hidden" style={{ minHeight: '100vh' }}>
					   {/* Removido background DarkVeil/SimpleDarkVeil para tema branco */}
					   {/* Sidebar Desktop - UI Profissional */}
					   {!isLoginPage && (
						   <aside
							   ref={sidebarRef}
							   className={`hidden sm:flex fixed left-0 top-0 h-screen transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"} bg-white border-r-4 border-blue-700 flex-col py-6 px-2 shadow-xl z-40`}
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
										   className={`block transition-all duration-300 mx-auto text-[#1e293b] ${sidebarOpen ? "scale-100" : "scale-90"}`}
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
												   className="flex items-center justify-center w-full h-12 rounded-lg transition-colors bg-blue-50  text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 hover:bg-blue-100  hover:cursor-pointer"
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
											   className={`group flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-all duration-200 pl-5
												   ${isActive ? "bg-blue-700 text-white font-semibold shadow-lg" : "text-blue-700 hover:bg-blue-700 hover:text-white"}
											   `}
											   style={isActive ? { boxShadow: "0 2px 16px 0 rgba(29,78,216,0.15)" } : {}}
											   aria-current={isActive ? "page" : undefined}
										   >
											   <Icon className={`w-5 h-5 flex-shrink-0 transition-colors
												   ${isActive ? "text-white" : "text-blue-700 group-hover:text-white"}
											   `} />
											   <span className={`transition-all duration-300 origin-left ${sidebarOpen ? "opacity-100 ml-2 scale-x-100" : "opacity-0 ml-0 scale-x-0 w-0"}`} style={{ width: sidebarOpen ? "auto" : 0, overflow: "hidden", whiteSpace: "nowrap" }}>{link.label}</span>
										   </a>
									   );
								   })}
							   </nav>
							   {/* Divider */}
							   {/* Divider */}
							   <div className="my-4 border-t border-blue-200" />
						   </aside>
					   )}

					{/* Menu Mobile */}
					{!isLoginPage && (
						<div className="sm:hidden fixed top-0 left-0 w-full z-50">
							<div className="flex items-center justify-between bg-gray-50/95 backdrop-blur-md px-3 py-3 shadow-lg border-b border-gray-200/50">
								<button
									className="flex items-center gap-2 text-blue-700 focus:outline-none hover:cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors"
									onClick={() => setSidebarOpen((v) => !v)}
									aria-label="Abrir menu"
									type="button"
								>
									<Menu className="w-6 h-6" />
								</button>
								<Logo
									className="block mx-auto text-[#1e293b]"
									width={110}
									height={40}
									style={{ height: 40, maxWidth: 110 }}
									aria-label="Logo Máquina de Vendas"
								/>
								<div className="w-10 h-10" /> {/* Espaço para alinhar */}
							</div>
							{sidebarOpen && (
								<>
									{/* Overlay */}
									<div 
										className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
										onClick={() => setSidebarOpen(false)}
									/>
									{/* Menu lateral */}
									   <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl border-r-4 border-blue-700 flex flex-col py-4 px-3 animate-fade-in z-50 overflow-y-auto">
										<div className="flex items-center justify-between mb-4 px-2">
											<Logo
												className="text-[#1e293b]"
												width={120}
												height={42}
												style={{ height: 42, maxWidth: 120 }}
												aria-label="Logo Máquina de Vendas"
											/>
											<button
												className="text-gray-400 hover:text-blue-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
												onClick={() => setSidebarOpen(false)}
												aria-label="Fechar menu"
												type="button"
											>
												<X className="w-5 h-5" />
											</button>
										</div>
										{/* Bloco do usuário */}
										<div className="flex items-center gap-3 px-4 py-4 border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-4">
											<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
												{userName ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
											</div>
											<div className="flex-1 min-w-0">
												<span className="font-semibold text-base text-blue-900 block truncate">{userName || 'Usuário'}</span>
												<span className="text-xs text-blue-600 ">Conectado</span>
											</div>
										</div>
										{/* Links de navegação principais */}
										<nav className="flex flex-col gap-1 mb-4">
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
															   className={`group flex items-center gap-4 rounded-xl px-4 py-3 font-medium transition-all duration-200
																   ${isActive ? "bg-blue-700 text-white font-semibold shadow-lg" : "text-blue-700 hover:bg-blue-700 hover:text-white"}
															   `}
															   style={
																   isActive
																	   ? { boxShadow: "0 4px 20px 0 rgba(29,78,216,0.25)" }
																	   : {}
															   }
															   aria-current={isActive ? "page" : undefined}
															   onClick={() => setSidebarOpen(false)}
														   >
															   <Icon className={`w-5 h-5 flex-shrink-0 transition-colors
																   ${isActive ? "text-white" : "text-blue-700 group-hover:text-white"}
															   `} />
															   <span className="text-base">{link.label}</span>
														   </a>
													);
												})}
										</nav>
										{/* Opções extras do usuário */}
										<div className="mt-auto border-t border-blue-100 pt-4 flex flex-col gap-1">
											   <a href="/configuracoes" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded-lg hover:bg-blue-50 transition-colors hover:cursor-pointer" onClick={() => setSidebarOpen(false)}>
												   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
													   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												   </svg>
												   Configurações
											   </a>
											<a href="/ajuda" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded-lg hover:bg-blue-50 transition-colors hover:cursor-pointer" onClick={() => setSidebarOpen(false)}>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												Ajuda
											</a>
											<a href="/feedback" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50  transition-colors hover:cursor-pointer" onClick={() => setSidebarOpen(false)}>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
												</svg>
												Feedback
											</a>
											<button onClick={() => { localStorage.removeItem('user'); window.location.href = '/login'; }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors hover:cursor-pointer mt-2">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
												</svg>
												Sair
											</button>
										</div>
									</div>
								</>
							)}
						</div>
					)}
					{/* Main content */}
					<div
						className={`relative flex-1 flex flex-col min-h-screen w-full min-w-0 transition-all duration-300 overflow-x-hidden z-0
									${!isLoginPage ? (sidebarOpen ? 'sm:pl-64' : 'sm:pl-16') : ''}`}
						style={{ background: 'transparent', backgroundColor: 'transparent' }}
					>
						{/* Header fixo no topo do conteúdo, exceto na página de login */}
						{!isLoginPage && isClient && (
							   <Header userName={userName} />
						)}
						<main
							className={`flex-1 overflow-y-auto overflow-x-hidden relative z-0 ${isLoginPage ? "p-0 bg-gradient-to-br from-gray-50 via-blue-50 to-white" : "pt-16 sm:pt-6 p-3 sm:p-6 md:p-8"
								}`}
							style={isLoginPage ? {} : { background: "transparent", backgroundColor: "transparent" }}
						>
							{children}
						</main>
						{/* Rodapé "quieto" no fim da tela, fora do login */}
						{!isLoginPage && (
							<footer className="w-full text-center text-xs text-blue-900 bg-transparent py-2 select-none">
								© 2025 Máquina de Vendas
							</footer>
						)}
					</div>
				</div>
		</>
	);
}


