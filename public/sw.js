const CACHE_NAME = 'seller-machine-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
];

const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const STATIC_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Só interceptar requisições do mesmo origem
  if (url.origin !== location.origin) {
    return;
  }

  // Estratégia para API routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          // Tentar buscar da rede primeiro
          const networkResponse = await fetch(request);
          
          if (networkResponse.ok) {
            // Cache apenas GET requests bem-sucedidas
            if (request.method === 'GET') {
              const responseClone = networkResponse.clone();
              // Adicionar timestamp para controle de expiração
              const responseWithTimestamp = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: {
                  ...responseClone.headers,
                  'sw-cached-at': Date.now().toString(),
                }
              });
              cache.put(request, responseWithTimestamp);
            }
            return networkResponse;
          }
          throw new Error('Network response not ok');
        } catch (error) {
          // Se falhou, tentar buscar do cache
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            const cachedAt = cachedResponse.headers.get('sw-cached-at');
            const isExpired = cachedAt && Date.now() - parseInt(cachedAt) > API_CACHE_DURATION;
            
            if (!isExpired) {
              return cachedResponse;
            }
          }
          
          // Se não tem cache ou expirou, retornar erro
          return new Response(JSON.stringify({ error: 'Offline and no cache available' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })
    );
    return;
  }

  // Estratégia para assets estáticos
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.includes('.')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
          const cachedAt = cachedResponse.headers.get('sw-cached-at');
          const isExpired = cachedAt && Date.now() - parseInt(cachedAt) > STATIC_CACHE_DURATION;
          
          if (!isExpired) {
            return cachedResponse;
          }
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const responseWithTimestamp = new Response(networkResponse.body, {
              status: networkResponse.status,
              statusText: networkResponse.statusText,
              headers: {
                ...networkResponse.headers,
                'sw-cached-at': Date.now().toString(),
              }
            });
            cache.put(request, responseWithTimestamp);
            return networkResponse;
          }
          return cachedResponse || networkResponse;
        } catch (error) {
          return cachedResponse || new Response('Offline', { status: 503 });
        }
      })
    );
    return;
  }

  // Estratégia para páginas (Network First)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response('Offline', { status: 503 });
        });
      })
  );
});

// Limpar cache antigo periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
