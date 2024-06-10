"use client";
import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Supplier } from "@/hooks/useSupplier";
import api from "@/services/api";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome é muito curto, insira no mínimo 5 caracteres" }),
  supplierIds: z.string(),
  totalPrice: z.coerce.number(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: any | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const title = initialData ? "Editar produto" : "Criar produto";
  const description = initialData
    ? "Editar um produto."
    : "Criar um novo produto";
  const toastMessage = initialData ? "Produto atualizado." : "Produto criado.";
  const action = initialData ? "Salvar alterações" : "Criar";

  const defaultValues = initialData
    ? {
        ...initialData,
        supplierIds: initialData.supplierList
          .map((supplier: Supplier) => supplier.id)
          .join(", "),
      }
    : {
        name: "",
        supplierIds: "",
        totalPrice: 0,
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      const formattedSupplierIds = data.supplierIds
        ? data.supplierIds
            .split(",")
            .map(Number)
            .filter((num) => !isNaN(num))
        : [];

      const formattedRequestData = {
        ...data,
        supplierIds: formattedSupplierIds,
      };

      if (initialData) {
        await api.put("/product", {
          id: initialData.id,
          ...formattedRequestData,
        });
      } else {
        await api.post("/product", formattedRequestData);
      }

      router.refresh();
      router.push(`/dashboard/product`);

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
                      placeholder="Nome do produto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplierIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ids dos Fornecedores</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="ex: 1, 5, 6..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button isLoading={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
