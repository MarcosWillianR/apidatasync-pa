import React, { useCallback, useState, createContext, useContext } from "react";

import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { getSession } from "next-auth/react";

interface StandardItem {
  [key: string]: string;
}

export interface Supplier {
  id: number;
  name: string;
  scope: string;
  description: string;
  requestUrl: string;
  costPerRequest: number;
  parameterType: string[];
  errorCondition: string;
  method: string;
  postBody: string | null;
  postHeader: object | null;
  standardResponse: StandardItem[];
  timeout: number;
}

interface SupplierContextProps {
  suppliers: Supplier[] | null;
  getSuppliers: () => Promise<void>;
  getSupplier: (id: number) => Promise<Supplier | null>;
  isLoading: boolean;
  deleteSupplier: (id: number) => Promise<void>;
  isDeletingSupplier: boolean;
}

const SupplierContext = createContext<SupplierContextProps>(
  {} as SupplierContextProps,
);

function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);
  const { toast } = useToast();

  const getSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);

      const session = await getSession();
      const { data } = await api.get("supplier", {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });

      setSuppliers(data.content);
    } catch (error: any) {
      console.log("ERROR:");
      console.log(error.response);

      toast({
        variant: "destructive",
        title: "Ops, houve um problema.",
        description: error,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getSupplier = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);

        const session = await getSession();
        const { data } = await api.get(`supplier/${id}`, {
          headers: {
            Authorization: `Bearer ${session?.user.token}`,
          },
        });

        return data || null;
      } catch (error: any) {
        console.log("ERROR:");
        console.log(error.response);

        toast({
          variant: "destructive",
          title: "Ops, houve um problema.",
          description: error,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  const deleteSupplier = useCallback(
    async (id: number) => {
      try {
        setIsDeletingSupplier(true);
        await api.delete(`supplier/${id}`);

        setSuppliers(
          (currentSuppliers) =>
            currentSuppliers?.filter((supplier) => supplier.id !== id) || null,
        );

        toast({
          title: "Sucesso!",
          description: "Fornecedor removido com sucesso.",
        });
      } catch (error: any) {
        console.log("ERROR:");
        console.log(error.response);

        toast({
          variant: "destructive",
          title: "Ops, houve um problema.",
          description: error,
        });
      } finally {
        setIsDeletingSupplier(false);
      }
    },
    [toast],
  );

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        getSuppliers,
        getSupplier,
        isLoading,
        deleteSupplier,
        isDeletingSupplier,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
}

function useSupplier() {
  const context = useContext(SupplierContext);
  return context;
}

export { SupplierProvider, useSupplier };
