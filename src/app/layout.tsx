"use client";

import Header from "../components/header";
import Logo from "../../components/Logo";
import { LoadingProvider, useLoading } from "../components/LoadingContext";
import { DataProvider } from "../components/DataProvider";
import { ServiceWorkerProvider } from "../components/ServiceWorkerProvider";
import { PerformanceMonitor } from "../components/PerformanceMonitor";
import { ToastProvider } from "../components/ui/toast";
import ProgressBar from "../components/ui/progress-bar";
import { GlobalNotificationProvider } from "../providers/GlobalNotificationProvider";
import GlobalToastContainer from "../components/GlobalToastContainer";
import GlobalNotificationBell from "../components/GlobalNotificationBell";
import { LayoutDashboard, Link2, Users, Menu, UserCog, X, Map, Settings, Brain, Briefcase } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import "./globals.css";
import { useRouter, usePathname } from "next/navigation";


function getNavLinks(userConta?: string) {
	const baseLinks = [
		{ type: "toggle", label: "Menu", icon: Menu },
		{ href: "/", label: "Dashboard", icon: LayoutDashboard },
		{ href: "/mapa-vendas", label: "Mapa de Vendas", icon: Map },
		{ href: "/carteira-vendedor", label: "Carteira de Vendedor", icon: Briefcase },
		{ href: "/clientes", label: "Clientes", icon: Users },
		{ href: "/associacoes", label: "Associações", icon: Link2 },
		{ href: "/ia", label: "Inteligência Artificial", icon: Brain },
	];
	// Verificar se o usuário é Admin ou GESTOR_MASTER
	if (userConta === "Admin" || userConta === "GESTOR_MASTER") {
		baseLinks.push({ href: "/usuarios", label: "Usuários", icon: UserCog });
	}
	return baseLinks;
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="pt-BR"
			suppressHydrationWarning
			className="w-full h-full min-h-screen"
		>
			<head>
				   <meta name="color-scheme" content="light" />
			</head>
			   <body className="bg-white text-gray-900 min-h-screen w-full h-full m-0 p-0 font-sans overflow-x-hidden"
				   style={{ background: '#fff' }}
				   suppressHydrationWarning>
				<ServiceWorkerProvider>
					<LoadingProvider>
						<DataProvider>
							<ToastProvider>
								<GlobalNotificationProvider>
									<LayoutContent>{children}</LayoutContent>
									<GlobalToastContainer />
								</GlobalNotificationProvider>
								<PerformanceMonitor />
							</ToastProvider>
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
					// Verificar se é o objeto completo com 'user' aninhado ou direto
					const userData = parsed.user || parsed;
					setUserName(userData.name || userData.nome ? String(userData.name || userData.nome) : undefined);
					setUserConta(userData.role || userData.conta ? String(userData.role || userData.conta) : undefined);
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
	
	const toggleSidebar = useCallback(() => {
		setSidebarOpen(prev => !prev);
	}, []);
	const pathname = usePathname();
	const [userName, setUserName] = useState<string | undefined>(undefined);
	const [userConta, setUserConta] = useState<string | undefined>(undefined);
	const [isClient, setIsClient] = useState(false);
	const isLoginPage = pathname === "/login" || pathname === "/redefinir-senha" || pathname === "/esqueci-senha" || pathname === "/nova-senha";

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
							   className={`hidden sm:flex fixed left-0 top-0 h-screen ${sidebarOpen ? "w-64" : "w-20"} flex-col py-6 px-2 shadow-xl z-40 sidebar-transition`}
							   aria-label="Menu lateral"
							   style={{
								   backgroundColor: '#003153',
								   boxShadow: sidebarOpen ? "4px 0 32px 0 rgba(0,0,0,0.13)" : undefined,
								   height: '100vh',
								   maxHeight: '100vh',
								   borderRight: '4px solid #003153',
								   transition: 'width 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
								   willChange: 'width',
								   transform: 'translateZ(0)'
							   }}
						   >
							   {/* Barra de destaque */}
							   <div className="absolute left-0 top-0 h-full w-1.5 rounded-r-lg" style={{ opacity: 0.85, backgroundColor: 'rgba(255,255,255,0.2)' }} />
							   {/* Logo e avatar */}
							   <div className="flex flex-col items-center gap-6 mb-10 relative">
								   <div className="flex items-center justify-center w-full">
									   <Logo
										   type={sidebarOpen ? 'full' : 'square'}
										   className="block mx-auto"
										   width={sidebarOpen ? 180 : 36}
										   height={sidebarOpen ? 64 : 36}
										   style={{ 
											   height: sidebarOpen ? 64 : 36, 
											   maxWidth: sidebarOpen ? 180 : 36, 
											   marginBottom: 0,
											   transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
											   willChange: 'width, height'
										   }}
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
												   onClick={toggleSidebar}
												   className="flex items-center justify-center w-full h-12 rounded-lg focus:outline-none mb-2 hover:cursor-pointer"
												   style={{ 
													   backgroundColor: 'rgba(255, 255, 255, 0.1)', 
													   color: 'white',
													   transition: 'background-color 0.15s ease-out'
												   }}
												   onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#003153'; }}
												   onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = 'white'; }}
												   onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px white'}
												   onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
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
											   className={`group flex items-center gap-3 rounded-lg px-3 py-3 font-medium pl-5 hover:cursor-pointer`}
											   style={isActive ? { 
												   backgroundColor: 'white',
												   color: '#003153',
												   fontWeight: '600',
												   boxShadow: "0 2px 16px 0 rgba(255,255,255,0.15)",
												   transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
											   } : { 
												   color: 'white',
												   transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
											   }}
											   onMouseEnter={(e) => {
												   if (!isActive) {
													   e.currentTarget.style.backgroundColor = 'white';
													   e.currentTarget.style.color = '#003153';
													   const icon = e.currentTarget.querySelector('svg');
													   if (icon) icon.style.color = '#003153';
												   }
											   }}
											   onMouseLeave={(e) => {
												   if (!isActive) {
													   e.currentTarget.style.backgroundColor = '';
													   e.currentTarget.style.color = 'white';
													   const icon = e.currentTarget.querySelector('svg');
													   if (icon) icon.style.color = 'white';
												   }
											   }}
											   aria-current={isActive ? "page" : undefined}
										   >
											   <Icon className={`w-5 h-5 flex-shrink-0 transition-colors`}
												   style={{ color: isActive ? '#003153' : 'white' }}
											   />
											   <span 
												   className="origin-left ml-2" 
												   style={{ 
													   opacity: sidebarOpen ? 1 : 0,
													   transform: sidebarOpen ? 'scaleX(1)' : 'scaleX(0)',
													   width: sidebarOpen ? "auto" : 0,
													   overflow: "hidden", 
													   whiteSpace: "nowrap",
													   transition: 'opacity 0.15s ease-out, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
													   willChange: 'opacity, transform'
												   }}
											   >{link.label}</span>
										   </a>
									   );
								   })}
							   </nav>
							   {/* Divider */}
							   {/* Divider */}
							   <div className="my-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
						   </aside>
					   )}

					{/* Menu Mobile */}
					{!isLoginPage && (
						<div className="sm:hidden fixed top-0 left-0 w-full z-50">
							<div className="flex items-center justify-between bg-gray-50/95 backdrop-blur-md px-3 py-3 shadow-lg border-b border-gray-200/50">
								<button
									className="flex items-center gap-2 focus:outline-none hover:cursor-pointer p-2 rounded-lg transition-colors"
									style={{ color: '#003153' }}
									onClick={toggleSidebar}
									onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 49, 83, 0.05)'}
									onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
									aria-label="Abrir menu"
									type="button"
								>
									<Menu className="w-6 h-6" />
								</button>
								<Logo
									type="full"
									className="block mx-auto"
									width={110}
									height={40}
									style={{ height: 40, maxWidth: 110 }}
								/>
								{/* Sino de notificações mobile */}
								<div className="flex items-center">
									<GlobalNotificationBell />
								</div>
							</div>
							{sidebarOpen && (
								<>
									{/* Overlay */}
									<div 
										className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
										onClick={() => setSidebarOpen(false)}
									/>
									{/* Menu lateral */}
									   <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] shadow-2xl flex flex-col py-4 px-3 animate-fade-in z-50 overflow-y-auto" style={{ backgroundColor: '#003153', borderRight: '4px solid #003153' }}>
										<div className="flex items-center justify-between mb-4 px-2">
											<Logo
												type="full"
												className=""
												width={160}
												height={56}
												style={{ height: 56, maxWidth: 160 }}
											/>
											<button
												className="p-2 rounded-lg transition-colors hover:cursor-pointer"
												style={{ color: 'white' }}
												onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#003153'; }}
												onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'white'; }}
												onClick={() => setSidebarOpen(false)}
												aria-label="Fechar menu"
												type="button"
											>
												<X className="w-5 h-5" />
											</button>
										</div>
										{/* Bloco do usuário */}
										<div className="flex items-center gap-3 px-4 py-4 border rounded-xl mb-4" style={{ 
											borderColor: 'rgba(255, 255, 255, 0.2)',
											background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.15))'
										}}>
											<div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg" style={{
												background: 'linear-gradient(to bottom right, white, #f0f0f0)',
												color: '#003153'
											}}>
												{userName ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
											</div>
											<div className="flex-1 min-w-0">
												<span className="font-semibold text-base block truncate" style={{ color: 'white' }}>{userName || 'Usuário'}</span>
												<span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Conectado</span>
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
															   className={`group flex items-center gap-4 rounded-xl px-4 py-3 font-medium transition-all duration-200 hover:cursor-pointer`}
															   style={isActive ? { 
																   backgroundColor: 'white',
																   color: '#003153',
																   fontWeight: '600',
																   boxShadow: '0 4px 12px 0 rgba(255,255,255,0.15)' 
															   } : { 
																   color: 'white'
															   }}
															   onMouseEnter={(e) => {
																   if (!isActive) {
																	   e.currentTarget.style.backgroundColor = 'white';
																	   e.currentTarget.style.color = '#003153';
																	   const icon = e.currentTarget.querySelector('svg');
																	   if (icon) icon.style.color = '#003153';
																   }
															   }}
															   onMouseLeave={(e) => {
																   if (!isActive) {
																	   e.currentTarget.style.backgroundColor = '';
																	   e.currentTarget.style.color = 'white';
																	   const icon = e.currentTarget.querySelector('svg');
																	   if (icon) icon.style.color = 'white';
																   }
															   }}
															   aria-current={isActive ? "page" : undefined}
															   onClick={() => setSidebarOpen(false)}
														   >
															   <Icon className={`w-5 h-5 flex-shrink-0 transition-colors`}
																   style={{ color: isActive ? '#003153' : 'white' }}
															   />
															   <span className="text-base">{link.label}</span>
														   </a>
													);
												})}
										</nav>
										{/* Opções extras do usuário */}
										<div className="mt-auto border-t pt-4 flex flex-col gap-1" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
											   <a href="/configuracoes" className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors hover:cursor-pointer" style={{ color: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#003153'; const icon = e.currentTarget.querySelector('svg'); if (icon) icon.style.color = '#003153'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'white'; const icon = e.currentTarget.querySelector('svg'); if (icon) icon.style.color = 'white'; }} onClick={() => setSidebarOpen(false)}>
												   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
													   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												   </svg>
												   Configurações
											   </a>
											<a href="/ajuda" className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors hover:cursor-pointer" style={{ color: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#003153'; const icon = e.currentTarget.querySelector('svg'); if (icon) icon.style.color = '#003153'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'white'; const icon = e.currentTarget.querySelector('svg'); if (icon) icon.style.color = 'white'; }} onClick={() => setSidebarOpen(false)}>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												Ajuda
											</a>
											<a href="/feedback" className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors hover:cursor-pointer" style={{ color: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#003153'; const icon = e.currentTarget.querySelector('svg'); if (icon) icon.style.color = '#003153'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'white'; const icon = e.currentTarget.querySelector('svg'); if (icon) icon.style.color = 'white'; }} onClick={() => setSidebarOpen(false)}>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
												</svg>
												Feedback
											</a>
											<button onClick={() => { localStorage.removeItem('user'); window.location.href = '/login'; }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm rounded-lg transition-colors hover:cursor-pointer mt-2" style={{ color: '#ff6b6b' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ff6b6b'; e.currentTarget.style.color = 'white'; const icon = e.currentTarget.querySelector('svg'); if (icon) icon.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#ff6b6b'; const icon = e.currentTarget.querySelector('svg'); if (icon) icon.style.color = '#ff6b6b'; }}>
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
							className={`flex-1 overflow-y-auto overflow-x-hidden relative z-0 ${isLoginPage ? "p-0 bg-gradient-to-br from-gray-50 via-blue-50 to-white" : "pt-20 sm:pt-16 lg:pt-6 p-2 sm:p-4 lg:p-6 xl:p-8"
								}`}
							style={isLoginPage ? {} : { background: "transparent", backgroundColor: "transparent" }}
						>
							{children}
						</main>
						{/* Rodapé "quieto" no fim da tela, fora do login */}
						{!isLoginPage && (
							<footer className="w-full text-center text-xs text-blue-900 bg-transparent py-2 select-none">
								© 2025 Sales Machine
							</footer>
						)}
					</div>
				</div>
		</>
	);
}


