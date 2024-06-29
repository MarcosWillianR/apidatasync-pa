"use client";
import * as z from "zod";
import { Dispatch, SetStateAction, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import xml2js from "xml2js";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Parameter, SupplierParameterList } from "./supplier-parameter-list";
import { SupplierRequestBodyList } from "./supplier-request-body-list";

import { KeyValueItem, SupplierKeyValueList } from "./supplier-key-value-list";

import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { useToast } from "../ui/use-toast";
import { Supplier } from "@/hooks/useSupplier";
import useAxiosAuth from "@/services/hooks/useAxiosAuth";
import { convertArrayToJson, convertObjectToSOAP, convertObjectToXML, identifyFormat } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome é muito curto, insira no mínimo 5 caracteres" }),
  scope: z.string(),
  description: z.string().min(10, {
    message: "A descrição é muito curta, insira no mínimo 10 caracteres",
  }),
  timeout: z.coerce.number(),
  errorCondition: z.string(),
  requestUrl: z.string().min(10, { message: "Insira uma url válida" }),
  costPerRequest: z.coerce.number(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: Supplier | null;
}

interface ArrayObjDTO {
  [key: string]: string;
}

interface RequestDataDTO {
  name: string;
  scope: string;
  description: string;
  timeout: number;
  errorCondition: string;
  parameters: string[];
  method: string;
  postHeader: ArrayObjDTO | null;
  postBody: string;
  requestUrl: string;
  costPerRequest: number;
  standardResponse: ArrayObjDTO | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();
  const [loading, setLoading] = useState(false);
  const [currentAccordionVisible, setCurrentAccordionVisible] = useState("");
  const [currentMethod, setCurrentMethod] = useState(() => {
    if (initialData !== null) {
      return initialData.method;
    }

    return "GET";
  });
  const [headers, setHeaders] = useState<KeyValueItem[]>(() => {
    if (initialData !== null && initialData.postHeader !== null) {
      const headersFormatted: KeyValueItem[] = [];

      if (initialData.postHeader !== null) {
        Object.keys(initialData.postHeader).forEach((key) => {
          const newItem: KeyValueItem = {
            id: uuidv4(),
            key,
            value: initialData.postHeader![key],
          };

          headersFormatted.push(newItem);
        });
      }

      return headersFormatted;
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
  const [requestBodies, setRequestBodies] = useState<KeyValueItem[]>(() => {
    if (initialData !== null && initialData.postBody !== null) {
      const requestBodiesFormatted: KeyValueItem[] = [];

      const type = identifyFormat(initialData.postBody);

      if (type === "JSON") {
        const postBodyParsed = JSON.parse(initialData.postBody);

        Object.keys(postBodyParsed).forEach((key) => {
          const newItem: KeyValueItem = {
            id: uuidv4(),
            key,
            value: postBodyParsed![key],
          };

          requestBodiesFormatted.push(newItem);
        });
      } else if (type === "XML") {
        xml2js.parseString(initialData.postBody, (error, result) => {
          if (!error) {
            Object.keys(result.XmlInputConsulta).forEach((key) => {
              if (key !== "$") {
                const newItem: KeyValueItem = {
                  id: uuidv4(),
                  key,
                  value: result.XmlInputConsulta[key],
                };

                requestBodiesFormatted.push(newItem);
              }
            });
          }
        });
      } else if (type === "SOAP") {
        xml2js.parseString(initialData.postBody, (error, result) => {
          const data = result["soap:Envelope"]["soap:Body"][0];

          Object.keys(data).forEach((dataKey) => {
            requestBodiesFormatted.push({
              id: uuidv4(),
              key: "SOAPRootName",
              value: dataKey,
            });

            Object.keys(data[dataKey][0]).forEach((paramKey) => {
              if (paramKey !== "$") {
                const newItem: KeyValueItem = {
                  id: uuidv4(),
                  key: paramKey,
                  value: data[dataKey][0][paramKey],
                };

                requestBodiesFormatted.push(newItem);
              }
            });
          });
        });
      }

      return requestBodiesFormatted;
    }

    return [];
  });
  const [currentBodyFormatter, setCurrentBodyFormatter] = useState(() => {
    if (initialData !== null) {
      return identifyFormat(initialData.postBody);
    }
    return "JSON";
  });
  const [parameters, setParameters] = useState<Parameter[]>(() => {
    if (initialData !== null) {
      return initialData.parameterType.map((pt) => ({
        id: uuidv4(),
        value: pt,
      }));
    }

    return [];
  });

  const title = initialData ? "Editar fornecedor" : "Criar fornecedor";
  const description = initialData ? "Editar um fornecedor." : "Criar um novo fornecedor";
  const toastMessage = initialData ? "Fornecedor atualizado." : "Fornecedor criado.";
  const action = initialData ? "Salvar alterações" : "Criar";

  const defaultValues = initialData
    ? initialData
    : {
        name: "",
        scope: "",
        description: "",
        timeout: 0,
        errorCondition: "",
        // method: "",
        requestUrl: "",
        // postBody: "",
        // postHeader: "",
        // standardResponse: "",
        costPerRequest: 0,
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function handleAddNewParameter() {
    setParameters((currentParameters) => {
      const newParameter = { id: uuidv4(), value: "" };
      return [...currentParameters, newParameter];
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
    setParameters((currentParameters) => currentParameters.filter((cp) => cp.id !== id));
  }

  function handleAddNewKeyValue(setList: Dispatch<SetStateAction<KeyValueItem[]>>) {
    setList((currentList) => {
      const newItem = {
        id: uuidv4(),
        key: "",
        value: "",
      };
      return [...currentList, newItem];
    });
  }

  function handleRemoveKeyValue(id: string, setList: Dispatch<SetStateAction<KeyValueItem[]>>) {
    setList((currentList) => currentList.filter((currentItem) => currentItem.id !== id));
  }

  function handleUpdateKeyValue(
    type: "key" | "value",
    value: string,
    id: string,
    setList: Dispatch<SetStateAction<KeyValueItem[]>>,
  ) {
    setList((currentList) =>
      currentList.map((currentItem) => {
        if (currentItem.id === id) {
          const updatedItem = {
            ...currentItem,
            ...(type === "key" && { key: value }),
            ...(type === "value" && { value: currentBodyFormatter === "SOAP" ? [value] : value }),
          };

          return updatedItem;
        }

        return currentItem;
      }),
    );
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const formattedRequestData: RequestDataDTO = {
        ...data,
        parameters: parameters.map((p) => p.value).filter((p) => p),
        postHeader: headers.length > 0 ? convertArrayToJson(headers) : null,
        standardResponse: standardResponses.length > 0 ? convertArrayToJson(standardResponses) : null,
        postBody: "",
        method: currentMethod,
      };

      if (currentBodyFormatter === "JSON") {
        const requestBodiesFormatted = convertArrayToJson(requestBodies);
        formattedRequestData.postBody = JSON.stringify(requestBodiesFormatted);
      }

      if (currentBodyFormatter === "XML") {
        const requestBodiesFormatted = convertArrayToJson(requestBodies);
        formattedRequestData.postBody = convertObjectToXML(requestBodiesFormatted);
      }

      if (currentBodyFormatter === "SOAP") {
        const soapRootName = requestBodies.find((item) => item.key === "SOAPRootName")?.value;
        const requestBodiesFormatted = convertArrayToJson(requestBodies.filter((item) => item.key !== "SOAPRootName"));

        if (soapRootName) {
          formattedRequestData.postBody = convertObjectToSOAP(soapRootName, requestBodiesFormatted);
        } else {
          toast({
            variant: "destructive",
            title: "SOAPRootName não encontrado!",
            description: "Informe o corpo do SOAP na chave 'SOAPRootName'",
          });
          return;
        }
      }

      setLoading(true);

      if (initialData) {
        await axiosAuth.put("/supplier", {
          id: initialData.id,
          ...formattedRequestData,
        });
      } else {
        await axiosAuth.post("/supplier", formattedRequestData);
      }

      router.refresh();
      router.push(`/dashboard/supplier`);

      toast({
        variant: "default",
        title: "Sucesso!",
        description: toastMessage,
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Dados iniciais</span>
          </div>

          <div className="gap-8 md:grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Nome do fornecedor" {...field} />
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
                    <Input disabled={loading} placeholder="Insira o escopo" {...field} />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Descrição do fornecedor" {...field} />
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

          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Dados da Requisição</span>
          </div>

          <div className="gap-8 md:grid md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-3 flex-col mb-2">
              <span className="text-sm">Método</span>

              <Tabs defaultValue="GET" value={currentMethod} onValueChange={setCurrentMethod}>
                <TabsList>
                  <TabsTrigger value="GET">GET</TabsTrigger>
                  <TabsTrigger value="POST">POST</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <FormField
              control={form.control}
              name="requestUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Url da requisição</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Url da requisição do fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Timeout da requisição" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="errorCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condição de Erro</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Condição de erro requisição" {...field} />
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
            <AccordionItem value="parameters">
              <AccordionTrigger>Adicionar Parâmetros</AccordionTrigger>
              <AccordionContent>
                <SupplierParameterList
                  parameters={parameters}
                  onChange={handleUpdateParameterValue}
                  onRemove={handleRemoveParameter}
                  onAddNew={handleAddNewParameter}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="headers">
              <AccordionTrigger>Adicionar Headers</AccordionTrigger>
              <AccordionContent>
                <SupplierKeyValueList list={headers} setList={setHeaders} title="Headers" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="requestBodies">
              <AccordionTrigger>Adicionar Corpo da requisição</AccordionTrigger>
              <AccordionContent>
                <SupplierRequestBodyList
                  requestBodies={requestBodies}
                  onChange={(type, value, id) => handleUpdateKeyValue(type, value, id, setRequestBodies)}
                  onRemove={(id) => handleRemoveKeyValue(id, setRequestBodies)}
                  onAddNew={() => handleAddNewKeyValue(setRequestBodies)}
                  currentBodyFormatter={currentBodyFormatter}
                  onChangeCurrentBodyFormatter={(value) => setCurrentBodyFormatter(value)}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="standardResponses">
              <AccordionTrigger>Adicionar Resposta padrão</AccordionTrigger>
              <AccordionContent>
                <SupplierKeyValueList list={standardResponses} setList={setStandardResponses} title="Resposta padrão" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
