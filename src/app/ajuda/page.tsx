"use client";

export default function AjudaPage() {
  return (
    <div className="max-w-2xl w-full mx-auto py-8 px-2 sm:py-12 sm:px-4 flex flex-col">
      <h1 className="text-3xl font-bold mb-4 text-blue-900 dark:text-blue-200">Ajuda</h1>
      <p className="mb-6 text-gray-700 dark:text-gray-300">Aqui você encontra respostas para dúvidas frequentes e orientações sobre o uso da plataforma Seller Machine.</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
        <li>Como acessar e navegar pelo painel de vendas.</li>
        <li>Como visualizar relatórios e gráficos.</li>
        <li>Como entrar em contato com o suporte.</li>
        <li>Como redefinir sua senha.</li>
      </ul>
      <div className="mt-8 text-sm text-blue-700 dark:text-blue-300">Esta página está em construção. Em breve, mais informações!</div>
    </div>
  );
}
