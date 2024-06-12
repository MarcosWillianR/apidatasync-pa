"use client";
import * as z from "zod";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { useToast } from "../ui/use-toast";
import api from "@/services/api";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome é muito curto, insira no mínimo 5 caracteres" }),
  scope: z.string(),
  description: z.string().min(10, {
    message: "A descrição é muito curta, insira no mínimo 10 caracteres",
  }),
  requestUrl: z.string().min(10, { message: "Insira uma url válida" }),
  costPerRequest: z.coerce.number(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: any | null;
}

interface Parameter {
  id: string;
  value: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const title = initialData ? "Editar fornecedor" : "Criar fornecedor";
  const description = initialData
    ? "Editar um fornecedor."
    : "Criar um novo fornecedor";
  const toastMessage = initialData
    ? "Fornecedor atualizado."
    : "Fornecedor criado.";
  const action = initialData ? "Salvar alterações" : "Criar";

  const defaultValues = initialData
    ? initialData
    : {
        name: "",
        scope: "",
        description: "",
        requestUrl: "",
        costPerRequest: 0,
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function handleAddNewParameter() {
    setParameters((currentParameters) => {
      const newParameter = { id: uuidv4(), value: "" };
      return [newParameter, ...currentParameters];
    });
  }

  function handleUpdateParameterValue(value: string, id: string) {
    setParameters((currentParameters) =>
      currentParameters.map((cp) => {
        if (cp.id === id) {
          return {
            ...cp,
            value,
          };
        }

        return cp;
      }),
    );
  }

  function handleRemoveParameter(id: string) {
    setParameters((currentParameters) =>
      currentParameters.filter((cp) => cp.id !== id),
    );
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      const formattedRequestData = {
        ...data,
        parameters: parameters.map((p) => p.value).filter((p) => p),
      };

      if (initialData) {
        await api.put("/supplier", {
          id: initialData.id,
          ...formattedRequestData,
        });
      } else {
        await api.post("/supplier", formattedRequestData);
      }

      router.refresh();
      router.push(`/dashboard/supplier`);

      toast({
        variant: "default",
        title: "Sucesso!",
        description: toastMessage,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ops, houve um problema.",
        description: "Tivemos um problema ao processar a requisição.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <div className="gap-8 md:grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nome do fornecedor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escopo</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Insira o escopo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Descrição do fornecedor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requestUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Url da requisição</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Url da requisição do fornecedor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costPerRequest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custo por requisição</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Parâmetros</span>

            <Button type="button" onClick={handleAddNewParameter}>
              <Plus className="h-4 w-4 mr-2" /> Novo parâmetro
            </Button>
          </div>

          {parameters.map((parameter) => (
            <div key={parameter.id} className="flex items-center gap-3 mb-4">
              <Input
                value={parameter.value}
                placeholder="Nome do parâmetro"
                onChange={(e) =>
                  handleUpdateParameterValue(e.target.value, parameter.id)
                }
              />

              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemoveParameter(parameter.id)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          ))}

          <Separator />

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
