"use client";

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl w-full mx-auto py-8 px-2 sm:py-12 sm:px-4 flex flex-col">
      <h1 className="text-3xl font-bold mb-4 text-blue-900">Feedback</h1>
      <p className="mb-6 text-gray-700">Sua opinião é muito importante para nós! Utilize o formulário abaixo para enviar sugestões, elogios ou relatar problemas encontrados na plataforma Seller Machine.</p>
      <form className="space-y-4">
        <textarea className="w-full min-h-[120px] p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 placeholder-blue-400 resize-y sm:resize-none" placeholder="Digite seu feedback aqui..." />
        <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:cursor-pointer">Enviar</button>
      </form>
      <div className="mt-8 text-sm text-blue-700">Esta página está em construção. Em breve, mais novidades!</div>
    </div>
  );
}
