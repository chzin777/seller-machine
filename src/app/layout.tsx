"use client";

import Header from "../components/header";
import ThemeToggle from "../components/theme-toggle";
import { LayoutDashboard, Link2, Users, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import "./globals.css";
import { useRouter, usePathname } from "next/navigation";

const navLinks = [
	{ type: "toggle", label: "Menu", icon: Menu },
	{ href: "/", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/associacoes", label: "Associações", icon: Link2 },
	{ href: "/clientes", label: "Clientes", icon: Users },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (typeof window === "undefined") return;
		const publicPaths = ["/login", "/cadastro"];
		if (!publicPaths.includes(pathname)) {
			const user = localStorage.getItem("user");
			if (!user) {
				router.replace("/login");
			}
		}
	}, [pathname, router]);

	useEffect(() => {
		if (!sidebarOpen) return;
		function handleClickOutside(event: MouseEvent) {
			if (
				sidebarRef.current &&
				event.target instanceof Node &&
				!sidebarRef.current.contains(event.target)
			) {
				setSidebarOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [sidebarOpen]);

	const isLoginPage = pathname === "/login";
	const [userName, setUserName] = useState<string | undefined>(undefined);
	useEffect(() => {
		if (typeof window !== "undefined") {
			const user = localStorage.getItem("user");
			if (user) {
				try {
					const parsed = JSON.parse(user);
					setUserName(parsed.nome ? String(parsed.nome) : undefined);
				} catch {}
			}
		}
	}, [pathname]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const applyTheme = () => {
				try {
					var theme = localStorage.getItem("theme");
					var isDark =
						theme === "dark" ||
						(!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
					if (isDark) {
						document.documentElement.classList.add("dark");
						document.body && (document.body.style.background = "#111827");
					} else {
						document.documentElement.classList.remove("dark");
						document.body && (document.body.style.background = "#f9fafb");
					}
				} catch {}
			};
			applyTheme();
		}
	}, [pathname]);

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
                var theme = localStorage.getItem('theme');
                var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.body && (document.body.style.background = '#111827');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.body && (document.body.style.background = '#f9fafb');
                }
              } catch(e) {}
            })();
          `}
				</Script>
			</head>
			<body className="bg-gray-50 text-gray-900 min-h-screen w-full h-full m-0 p-0 dark:bg-gray-900 dark:text-gray-100 font-sans">
				<div className="flex min-h-screen">
					{/* Sidebar */}
					<aside
						ref={sidebarRef}
						className={`relative transition-all duration-300 ${
							sidebarOpen ? "w-64" : "w-16"
						} bg-gray-50 dark:bg-gray-900 border-r-0 flex flex-col py-6 px-2 gap-8 shadow-xl z-20 ${
							isLoginPage ? "hidden" : ""
						}`}
						aria-label="Menu lateral"
						style={{
							boxShadow: sidebarOpen
								? "4px 0 24px 0 rgba(0,0,0,0.12)"
								: undefined,
						}}
					>
						{/* Barra azul vertical */}
						<div
							className="absolute left-0 top-0 h-full w-1.5 bg-blue-700 rounded-r-lg"
							style={{ opacity: 0.85 }}
						/>
						{/* Logo centralizada no topo */}
						<div
							className={`flex flex-col items-center mb-0 transition-all duration-300 group/sidebar relative px-0`}
						>
							{sidebarOpen ? (
								<img
									src="/images/logo.png"
									alt="Logo Máquina de Vendas"
									className="block transition-all duration-300 mx-auto"
									style={{
										height: 96,
										maxWidth: 200,
										marginBottom: 0,
									}}
								/>
							) : (
								<img
									src="/images/logo.png"
									alt="Logo Máquina de Vendas"
									className="block transition-all duration-300 mx-auto"
									style={{
										height: 40,
										maxWidth: 40,
										marginBottom: 0,
									}}
								/>
							)}
						</div>
						{/* Ícones do menu lateral colados na logo */}
						<nav className="flex flex-col gap-1 mt-0">
							{navLinks.map((link, idx) => {
								const Icon = link.icon;
								if (link.type === "toggle") {
									return (
										<button
											key={"toggle-menu"}
											className={`group flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors hover:bg-blue-700/10 hover:text-blue-700 text-blue-700 dark:text-blue-200 focus:outline-none ${
												!sidebarOpen ? "justify-center px-2" : ""
											}`}
											style={{
												boxShadow: "none",
												border: "none",
												background: "none",
												width: "100%",
											}}
											onClick={() => setSidebarOpen(!sidebarOpen)}
											aria-label={
												sidebarOpen ? "Recolher menu" : "Expandir menu"
											}
											tabIndex={0}
											type="button"
										>
											<Icon
												className={`w-5 h-5 transition-colors group-hover:text-blue-300 hover:cursor-pointer ${
													sidebarOpen ? "text-blue-400" : "text-blue-400"
												}`}
											/>
											<span
												className={`${
													sidebarOpen ? "block" : "hidden"
												} transition-all duration-300 hover:cursor-pointer`}
											>
												{link.label}
											</span>
										</button>
									);
								}
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
										className={`group flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors hover:bg-blue-700/10 hover:text-blue-700 text-blue-700 dark:text-blue-200 ${
											sidebarOpen ? "" : "justify-center px-2 hover:cursor-pointer"
										} ${isActive ? "bg-blue-700 text-white font-semibold shadow" : ""}`}
										tabIndex={0}
										style={
											isActive
												? { boxShadow: "0 2px 16px 0 rgba(29,78,216,0.15)" }
												: {}
										}
										aria-current={isActive ? "page" : undefined}
									>
										<Icon
											className={`w-5 h-5 transition-colors ${
												isActive
													? "text-yellow-300 dark:text-yellow-200 drop-shadow"
													: "text-blue-400 group-hover:text-blue-300"
											}`}
										/>
										<span
											className={`${
												sidebarOpen ? "block" : "hidden"
											} transition-all duration-300`}
										>
											{link.label}
										</span>
									</a>
								);
							})}
						</nav>
					</aside>
					{/* Main content */}
					<div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
						{/* Content */}
						<main
							className={`flex-1 overflow-y-auto ${
								isLoginPage ? "p-0 bg-transparent" : "p-6 sm:p-8 bg-transparent"
							}`}
							style={isLoginPage ? { background: "transparent" } : {}}
						>
							<div className={isLoginPage ? "hidden" : ""}>
								<Header
									userName={userName}
									title={
										pathname === "/ajuda"
											? "Ajuda"
											: pathname === "/feedback"
											? "Feedback"
											: pathname === "/configuracoes"
											? "Configurações"
											: pathname === "/"
											? "Painel de Vendas"
											: pathname === "/associacoes"
											? "Associações"
											: pathname.startsWith("/clientes")
											? "Clientes"
											: "Seller Machine"
									}
								/>
							</div>
							{children}
							{/* Rodapé visível apenas fora do login */}
							{!isLoginPage && (
								<footer className="w-full text-center text-xs text-blue-200 mt-8 select-none">
									© 2025 Seller Machine
								</footer>
							)}
						</main>
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


