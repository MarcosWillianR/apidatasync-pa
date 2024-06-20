import React, { useCallback, useState, createContext, useContext } from "react";

import useAxiosAuth from "@/services/hooks/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";

interface ArrayObjDTO {
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
  postBody: string;
  postHeader: ArrayObjDTO | null;
  standardResponse: ArrayObjDTO | null;
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

const SupplierContext = createContext<SupplierContextProps>({} as SupplierContextProps);

function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);

  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();

  const getSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data } = await axiosAuth.get("supplier");

      setSuppliers(data.content);
    } finally {
      setIsLoading(false);
    }
  }, [axiosAuth]);

  const getSupplier = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);

        const { data } = await axiosAuth.get(`supplier/${id}`);

        return data || null;
      } finally {
        setIsLoading(false);
      }
    },
    [axiosAuth],
  );

  const deleteSupplier = useCallback(
    async (id: number) => {
      try {
        setIsDeletingSupplier(true);
        await axiosAuth.delete(`supplier/${id}`);

        setSuppliers((currentSuppliers) => currentSuppliers?.filter((supplier) => supplier.id !== id) || null);

        toast({
          title: "Sucesso!",
          description: "Fornecedor removido com sucesso.",
        });
      } finally {
        setIsDeletingSupplier(false);
      }
    },
    [axiosAuth, toast],
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
