import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export type AuthResult =
  | { ok: true }
  | { ok: false; erro: string };

export async function entrar(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || data.user.app_metadata?.role !== "admin") {
    if (data.session) {
      await supabase.auth.signOut();
    }

    // Mensagem genérica: não revela se o email existe
    return { ok: false, erro: "Credenciais inválidas." };
  }

  return { ok: true };
}

/**
 * Muda a palavra-passe do utilizador com sessão activa.
 * O Supabase não pede a palavra-passe actual: basta ter sessão válida.
 */
export async function alterarPassword(
  novaPassword: string
): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({
    password: novaPassword
  });

  if (error) {
    return {
      ok: false,
      erro: "Não foi possível alterar a palavra-passe. Tente novamente."
    };
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

  if (!sessao || sessao.user.app_metadata?.role !== "admin") {
    if (sessao) {
      await supabase.auth.signOut();
    }

    window.location.replace("/admin");
    return false;
  }

  return true;
}
