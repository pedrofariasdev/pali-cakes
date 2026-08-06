import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export type AuthResult =
  | { ok: true }
  | { ok: false; erro: string };

export async function entrar(
  email: string,
  password: string
): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    // Mensagem genérica: não revela se o email existe
    return { ok: false, erro: "Credenciais inválidas." };
  }

  return { ok: true };
}

export async function sair(): Promise<void> {
  await supabase.auth.signOut();
  window.location.href = "/admin";
}

export async function obterSessao(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Protege uma página de admin.
 * Redireciona para o login se não houver sessão.
 * Devolve true quando o acesso é válido.
 */
export async function exigirSessao(): Promise<boolean> {
  const sessao = await obterSessao();

  if (!sessao) {
    window.location.replace("/admin");
    return false;
  }

  return true;
}