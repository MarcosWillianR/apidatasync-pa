"use client";
import * as z from "zod";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { useToast } from "../ui/use-toast";
import api from "@/services/api";
import { ProductDetail, ProductDocumentationParam } from "@/hooks/useProduct";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { KeyValueItem, SupplierKeyValueList } from "./supplier-key-value-list";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useSupplier } from "@/hooks/useSupplier";
import { convertArrayToJson } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { ProductDocParamList } from "./product-doc-param-list";

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome é muito curto, insira no mínimo 5 caracteres" }),
  docTitle: z.string(),
  docDescription: z.string(),
  docCurl: z.string(),
  totalPrice: z.coerce.number(),
  totalCost: z.coerce.number(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: ProductDetail | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { suppliers, getSuppliers } = useSupplier();
  const [loading, setLoading] = useState(false);
  const [currentAccordionVisible, setCurrentAccordionVisible] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>(() => {
    if (initialData !== null) {
      return initialData.supplierList.map((supplier) => supplier.id);
    }
    return [];
  });
  const [standardResponses, setStandardResponses] = useState<KeyValueItem[]>(() => {
    if (initialData !== null && initialData.standardResponse !== null) {
      const standardResponsesFormatted: KeyValueItem[] = [];

      Object.keys(initialData.standardResponse).forEach((key) => {
        const newItem: KeyValueItem = {
          id: uuidv4(),
          key,
          value: initialData.standardResponse![key],
        };

        standardResponsesFormatted.push(newItem);
      });

      return standardResponsesFormatted;
    }

    return [];
  });
  const [docParams, setDocParams] = useState<ProductDocumentationParam[]>([]);

  const title = initialData ? "Editar produto" : "Criar produto";
  const description = initialData ? "Editar um produto." : "Criar um novo produto";
  const toastMessage = initialData ? "Produto atualizado." : "Produto criado.";
  const action = initialData ? "Salvar alterações" : "Criar";

  const defaultValues = initialData
    ? {
        ...initialData,
        docTitle: initialData?.doc?.title,
        docDescription: initialData?.doc?.description,
        docCurl: initialData?.doc?.curl,
      }
    : {
        name: "",
        title: "",
        docTitle: "",
        docDescription: "",
        docCurl: "",
        totalPrice: 0,
        totalCost: 0,
      };

  function changeSupplierSelected(id: number) {
    setSelectedSuppliers((currentSelectedSuppliers) => {
      const findSupplierIndex = currentSelectedSuppliers.findIndex((css) => css === id);

      if (findSupplierIndex !== -1) {
        return currentSelectedSuppliers.filter((css) => css !== id);
      }

      return [...currentSelectedSuppliers, id];
    });
  }

  function handleAddNewDocParam() {
    setDocParams((currentDocParams) => {
      const newDocParam = {
        id: uuidv4(),
        name: "",
        description: "",
        type: "",
      };
      return [...currentDocParams, newDocParam];
    });
  }

  function handleChangeDocParam(changeType: string, value: string, id: number | string) {
    setDocParams((currentDocParams) =>
      currentDocParams.map((docParam) => {
        if (docParam.id === id) {
          return {
            ...docParam,
            [changeType]: value,
          };
        }
        return docParam;
      }),
    );
  }

  function handleRemoveDocParam(id: number | string) {
    setDocParams((currentDocParams) => currentDocParams.filter((docParam) => docParam.id !== id));
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      const formattedDocDTO = {
        title: data.docTitle,
        description: data.docDescription,
        curl: data.docCurl,
        params: docParams.map(({ id, name, description, type }) => {
          if (typeof id === "string") return { name, description, type };
          return { id, name, description, type };
        }),
      };

      const formattedRequestDTO = {
        name: data.name,
        totalPrice: data.totalPrice,
        supplierIds: selectedSuppliers,
        standardResponse: standardResponses.length > 0 ? convertArrayToJson(standardResponses) : null,
        doc: formattedDocDTO,
      };

      if (initialData) {
        await api.put("/product", {
          id: initialData.id,
          ...formattedRequestDTO,
        });
      } else {
        await api.post("/product", formattedRequestDTO);
      }

      router.refresh();
      router.push(`/dashboard/product`);

      toast({
        variant: "default",
        title: "Sucesso!",
        description: toastMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let totalCost = 0;

    if (selectedSuppliers.length > 0) {
      selectedSuppliers.forEach((selectedSupplier) => {
        const findSupplierIndex = suppliers.findIndex((supplier) => supplier.id === selectedSupplier);
        if (findSupplierIndex !== -1) totalCost += suppliers[findSupplierIndex].costPerRequest;
      });
    }

    form.setValue("totalCost", totalCost);
  }, [form, selectedSuppliers, suppliers]);

  useEffect(() => {
    getSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          <div className="gap-8 md:grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Nome do produto" {...field} />
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

            <FormField
              control={form.control}
              name="totalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custo total</FormLabel>
                  <FormControl>
                    <Input type="number" disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Accordion
            type="single"
            collapsible
            value={currentAccordionVisible}
            onValueChange={setCurrentAccordionVisible}
          >
            <AccordionItem value="standardResponses">
              <AccordionTrigger>Adicionar Resposta padrão</AccordionTrigger>
              <AccordionContent>
                <SupplierKeyValueList list={standardResponses} setList={setStandardResponses} title="Resposta padrão" />
              </AccordionContent>
            </AccordionItem>

            {suppliers.length > 0 && (
              <AccordionItem value="suppliers">
                <AccordionTrigger>Selecionar fornecedores</AccordionTrigger>
                <AccordionContent>
                  <div className="flex gap-6 items-center mt-6 flex-wrap">
                    {suppliers.map((supplier) => {
                      const checkedIndex = selectedSuppliers.findIndex((ss) => ss === supplier.id);

                      return (
                        <div key={supplier.id} className="flex items-center gap-2">
                          <Checkbox
                            id={supplier.name}
                            checked={checkedIndex !== -1}
                            onCheckedChange={() => changeSupplierSelected(supplier.id)}
                          />
                          <Label htmlFor={supplier.name}>{supplier.name}</Label>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="doc">
              <AccordionTrigger>Adicionar Documentação</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3">
                  <FormField
                    control={form.control}
                    name="docTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titulo</FormLabel>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder="Titulo que vai na documentação desse produto"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="docDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={loading}
                            placeholder="Descrição que vai na documentação desse produto"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="docCurl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CURL</FormLabel>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder="CURL que vai na documentação desse produto"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <ProductDocParamList
                    docParams={docParams}
                    onAddNew={handleAddNewDocParam}
                    onChange={handleChangeDocParam}
                    onRemove={handleRemoveDocParam}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button isLoading={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
