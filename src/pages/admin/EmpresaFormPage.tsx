import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { empresaService } from "@/lib/services";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  razaoSocial: z.string().min(3, "Mínimo 3 caracteres"),
  nomeFantasia: z.string().min(2, "Mínimo 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  inscricaoEstadual: z.string().optional(),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EmpresaFormPage() {
  const { id } = useParams();
  const isEdit = !!id && id !== "nova";
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isEdit) {
      empresaService.obterPorId(id!).then((emp) => {
        if (emp) reset(emp);
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await empresaService.salvar({ ...data, id: isEdit ? id : undefined });
      toast({
        title: isEdit ? "Empresa atualizada" : "Empresa criada",
        description: `${data.nomeFantasia} salva com sucesso.`,
      });
      navigate("/admin/empresas");
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const fields: { name: keyof FormData; label: string; required?: boolean }[] = [
    { name: "razaoSocial", label: "Razão Social", required: true },
    { name: "nomeFantasia", label: "Nome Fantasia", required: true },
    { name: "cnpj", label: "CNPJ", required: true },
    { name: "inscricaoEstadual", label: "Inscrição Estadual" },
    { name: "email", label: "E-mail", required: true },
    { name: "telefone", label: "Telefone" },
  ];

  return (
    <>
      <PageHeader
        title={isEdit ? "Editar Empresa" : "Nova Empresa"}
        description={isEdit ? "Altere os dados da empresa" : "Cadastre uma nova empresa no sistema"}
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <Label htmlFor={f.name}>
                    {f.label}
                    {f.required && <span className="text-destructive ml-0.5">*</span>}
                  </Label>
                  <Input id={f.name} {...register(f.name)} />
                  {errors[f.name] && (
                    <p className="text-xs text-destructive">{errors[f.name]?.message}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/empresas")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
