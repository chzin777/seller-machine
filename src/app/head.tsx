export default function Head() {
  return (
    <>
      <title>Sales Machine - Dashboard Comercial</title>
      <meta name="description" content="Dashboard comercial com indicadores, gráficos e análise de vendas por região" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" content="#1e40af" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Sales Machine" />
      
      {/* PWA */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" type="image/png" href="/images/logo.png" />
      <link rel="apple-touch-icon" href="/images/logo.png" />
      
      {/* Preconnect para APIs externas */}
      <link rel="preconnect" href="https://api.exemplo.com" />
      <link rel="dns-prefetch" href="https://api.exemplo.com" />
      
      {/* Prefetch de recursos críticos */}
      <link rel="prefetch" href="/api/proxy?url=/api/indicadores/receita-total" />
      
      {/* Preload de fontes críticas se houver */}
      <link rel="preload" href="/fonts/custom-font.woff2" as="font" type="font/woff2" crossOrigin="" />
    </>
  );
}
