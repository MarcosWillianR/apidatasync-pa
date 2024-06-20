"use client";
import * as z from "zod";
import { Plus } from "lucide-react";
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
import { Parameter, SupplierParameterList } from "./supplier-parameter-list";
import { HeaderItem, SupplierHeaderList } from "./supplier-header-list";
import { RequestBodyItem, SupplierRequestBodyList } from "./supplier-request-body-list";
import {
  StandardResponseItem,
  SupplierStandardResponseList,
} from "./supplier-standard-response-list";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { useToast } from "../ui/use-toast";
import { Supplier } from "@/hooks/useSupplier";
import api from "@/services/api";
import { convertArrayToJson, convertObjectToXML } from "@/lib/utils";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome é muito curto, insira no mínimo 5 caracteres" }),
  scope: z.string(),
  description: z.string().min(10, {
    message: "A descrição é muito curta, insira no mínimo 10 caracteres",
  }),
  timeout: z.coerce.number(),
  errorCondition: z.string(),
  method: z.string(),
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
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useState<HeaderItem[]>([]);
  const [standardResponses, setStandardResponses] = useState<StandardResponseItem[]>([]);
  const [requestBodies, setRequestBodies] = useState<RequestBodyItem[]>([]);
  const [currentBodyFormatter, setCurrentBodyFormatter] = useState("json");
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
        method: "",
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
    setParameters((currentParameters) => currentParameters.filter((cp) => cp.id !== id));
  }

  function handleAddNewHeader() {
    setHeaders((currentHeaders) => {
      const newHeader = {
        id: uuidv4(),
        header: "",
        value: "",
        enabled: true,
      };
      return [newHeader, ...currentHeaders];
    });
  }

  function handleRemoveHeader(id: string) {
    setHeaders((currentHeaders) =>
      currentHeaders.filter((currentHeader) => currentHeader.id !== id),
    );
  }

  function handleUpdateHeader(type: "header" | "value", value: string, id: string) {
    setHeaders((currentHeaders) =>
      currentHeaders.map((currentHeader) => {
        if (currentHeader.id === id) {
          const updatedHeader = {
            ...currentHeader,
            ...(type === "header" && { header: value }),
            ...(type === "value" && { value }),
          };

          return updatedHeader;
        }

        return currentHeader;
      }),
    );
  }

  // function handleChangeHeaderEnabled(id: string) {
  //   setHeaders((currentHeaders) =>
  //     currentHeaders.map((currentHeader) => {
  //       if (currentHeader.id === id) {
  //         return {
  //           ...currentHeader,
  //           enabled: !currentHeader.enabled,
  //         };
  //       }

  //       return currentHeader;
  //     }),
  //   );
  // }

  function handleAddNewStandardResponse() {
    setStandardResponses((currentStandardResponses) => {
      const newStandardResponse = {
        id: uuidv4(),
        key: "",
        value: "",
      };
      return [newStandardResponse, ...currentStandardResponses];
    });
  }

  function handleRemoveStandardResponse(id: string) {
    setStandardResponses((currentStandardResponses) =>
      currentStandardResponses.filter(
        (currentStandardResponse) => currentStandardResponse.id !== id,
      ),
    );
  }

  function handleUpdateStandardResponse(type: "key" | "value", value: string, id: string) {
    setStandardResponses((currentStandardResponses) =>
      currentStandardResponses.map((standardResponse) => {
        if (standardResponse.id === id) {
          const updatedStandardResponse = {
            ...standardResponse,
            ...(type === "key" && { key: value }),
            ...(type === "value" && { value }),
          };

          return updatedStandardResponse;
        }

        return standardResponse;
      }),
    );
  }

  function handleAddNewRequestBody() {
    setRequestBodies((currentRequestBodies) => {
      const newRequestBody = {
        id: uuidv4(),
        key: "",
        value: "",
      };
      return [newRequestBody, ...currentRequestBodies];
    });
  }

  function handleRemoveRequestBody(id: string) {
    setRequestBodies((currentRequestBodies) =>
      currentRequestBodies.filter((currentRequestBody) => currentRequestBody.id !== id),
    );
  }

  function handleUpdateRequestBody(type: "key" | "value", value: string, id: string) {
    setRequestBodies((currentRequestBodies) =>
      currentRequestBodies.map((requestBody) => {
        if (requestBody.id === id) {
          const updatedRequestBody = {
            ...requestBody,
            ...(type === "key" && { key: value }),
            ...(type === "value" && { value }),
          };

          return updatedRequestBody;
        }

        return requestBody;
      }),
    );
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const formattedRequestData: RequestDataDTO = {
        ...data,
        parameters: parameters.map((p) => p.value).filter((p) => p),
        postHeader:
          headers.length > 0
            ? convertArrayToJson(headers.map(({ header, value }) => ({ key: header, value })))
            : null,
        standardResponse:
          standardResponses.length > 0
            ? convertArrayToJson(standardResponses.map(({ key, value }) => ({ key, value })))
            : null,
        postBody: "",
      };

      const requestBodiesFormatted = convertArrayToJson(
        requestBodies.map(({ key, value }) => ({ key, value })),
      );

      if (currentBodyFormatter === "json") {
        formattedRequestData.postBody = JSON.stringify(requestBodiesFormatted);
      }

      if (currentBodyFormatter === "xml") {
        formattedRequestData.postBody = convertObjectToXML(requestBodiesFormatted);
      }

      setLoading(true);

      if (initialData) {
        await api.put(
          "/supplier",
          {
            id: initialData.id,
            ...formattedRequestData,
          },
          { headers: { Authorization: `Bearer ${session.data?.user.token}` } },
        );
      } else {
        await api.post("/supplier", formattedRequestData, {
          headers: { Authorization: `Bearer ${session.data?.user.token}` },
        });
      }

      router.refresh();
      router.push(`/dashboard/supplier`);

      toast({
        variant: "default",
        title: "Sucesso!",
        description: toastMessage,
      });

      return;
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

          <div className="gap-8 md:grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="GET, POST, PUT, DELETE" {...field} />
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
          </div>

          <SupplierParameterList
            parameters={parameters}
            onChange={handleUpdateParameterValue}
            onRemove={handleRemoveParameter}
            onAddNew={handleAddNewParameter}
          />

          <SupplierHeaderList
            headers={headers}
            onChange={handleUpdateHeader}
            onRemove={handleRemoveHeader}
            onAddNew={handleAddNewHeader}
            // onCheckedChange={handleChangeHeaderEnabled}
          />

          <SupplierRequestBodyList
            requestBodies={requestBodies}
            onChange={handleUpdateRequestBody}
            onRemove={handleRemoveRequestBody}
            onAddNew={handleAddNewRequestBody}
            currentBodyFormatter={currentBodyFormatter}
            onChangeCurrentBodyFormatter={(value) => setCurrentBodyFormatter(value)}
          />

          <SupplierStandardResponseList
            standardResponses={standardResponses}
            onChange={handleUpdateStandardResponse}
            onRemove={handleRemoveStandardResponse}
            onAddNew={handleAddNewStandardResponse}
          />

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
