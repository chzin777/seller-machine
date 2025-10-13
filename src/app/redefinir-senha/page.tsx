"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Carregando...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}