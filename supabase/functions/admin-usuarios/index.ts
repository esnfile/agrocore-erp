// Gestão de usuários — exclusiva do perfil ADMINISTRADOR.
// O cadastro público está desativado; esta é a única porta para criar usuários.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const PERFIS = ["ADMINISTRADOR", "OPERADOR", "CONSULTA"];

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
function erro(status: number, message: string, errors: string[] = []) {
  return json(status, { success: false, message, errors });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!token) return erro(401, "Sessão ausente.");
    const { data: u, error: uErr } = await admin.auth.getUser(token);
    if (uErr || !u.user) return erro(401, "Sessão inválida.");
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "ADMINISTRADOR" });
    if (!isAdmin) return erro(401, "Apenas Administrador pode gerenciar usuários.");

    const body = await req.json().catch(() => ({}));
    const acao = body?.acao;

    if (acao === "listar") {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        admin.from("profiles").select("*").order("criado_em"),
        admin.from("user_roles").select("user_id, role"),
      ]);
      const lista = (profiles ?? []).map((p) => ({
        ...p,
        perfil:
          roles?.find((r) => r.user_id === p.id && r.role === "ADMINISTRADOR")?.role ??
          roles?.find((r) => r.user_id === p.id && r.role === "OPERADOR")?.role ??
          "CONSULTA",
      }));
      return json(200, { success: true, data: lista });
    }

    const perfil = String(body?.perfil ?? "");
    const filiais: string[] = Array.isArray(body?.filiaisPermitidas) ? body.filiaisPermitidas.map(String) : [];
    const empresas: string[] = Array.isArray(body?.empresasPermitidas) ? body.empresasPermitidas.map(String) : [];
    if (acao === "criar" || acao === "atualizar") {
      if (!PERFIS.includes(perfil)) return erro(400, "Perfil inválido.");
      if (filiais.length === 0) return erro(400, "Vincule ao menos uma filial.");
    }

    async function definirPerfil(userId: string) {
      await admin.from("user_roles").delete().eq("user_id", userId);
      const { error } = await admin.from("user_roles").insert({ user_id: userId, role: perfil });
      if (error) throw error;
    }

    if (acao === "criar") {
      const nome = String(body?.nome ?? "").trim();
      const email = String(body?.email ?? "").trim().toLowerCase();
      const senha = String(body?.senha ?? "");
      const errs: string[] = [];
      if (nome.length < 2 || nome.length > 150) errs.push("Nome deve ter entre 2 e 150 caracteres.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) errs.push("E-mail inválido.");
      if (senha.length < 8) errs.push("Senha deve ter ao menos 8 caracteres.");
      if (errs.length) return erro(400, "Dados inválidos.", errs);

      const { data: criado, error } = await admin.auth.admin.createUser({
        email, password: senha, email_confirm: true, user_metadata: { nome },
      });
      if (error || !criado.user) {
        const msg = error?.message?.includes("already") ? "Este e-mail já está cadastrado." : (error?.message ?? "Falha ao criar usuário.");
        return erro(400, msg);
      }
      await admin.from("profiles").update({
        nome, filiais_permitidas: filiais, empresas_permitidas: empresas,
        filial_id: filiais[0], empresa_id: body?.empresaId ?? "e1", atualizado_em: new Date().toISOString(),
      }).eq("id", criado.user.id);
      await definirPerfil(criado.user.id);
      return json(201, { success: true, data: { id: criado.user.id } });
    }

    if (acao === "atualizar") {
      const id = String(body?.id ?? "");
      if (!id) return erro(400, "Usuário não informado.");
      if (id === u.user.id && perfil !== "ADMINISTRADOR") return erro(400, "Você não pode remover seu próprio perfil Administrador.");
      const ativo = body?.ativo !== false;
      if (id === u.user.id && !ativo) return erro(400, "Você não pode desativar a si mesmo.");
      await admin.from("profiles").update({
        filiais_permitidas: filiais, empresas_permitidas: empresas, ativo,
        atualizado_em: new Date().toISOString(),
      }).eq("id", id);
      await definirPerfil(id);
      await admin.auth.admin.updateUserById(id, { ban_duration: ativo ? "none" : "876000h" });
      return json(200, { success: true });
    }

    return erro(400, "Ação inválida.");
  } catch (e) {
    return erro(500, "Falha interna.", [e instanceof Error ? e.message : String(e)]);
  }
});
