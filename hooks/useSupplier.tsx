import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";

import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

export interface Supplier {
  id: number;
  name: string;
  scope: string;
  description: string;
  requestUrl: string;
  costPerRequest: number;
  parameterType: string[];
}

interface SupplierContextProps {
  suppliers: Supplier[] | null;
  getSuppliers: () => Promise<void>;
  getSupplier: (id: number) => Supplier | null;
  isLoading: boolean;
  deleteSupplier: (id: number) => Promise<void>;
  isDeletingSupplier: boolean;
}

const SupplierContext = createContext<SupplierContextProps>(
  {} as SupplierContextProps,
);

function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);
  const { toast } = useToast();

  const getSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("supplier");
      setSuppliers(data.content);
    } catch (error: any) {
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
    (id: number) => {
      const supplier = suppliers?.find((supplier) => supplier.id === id);
      return supplier || null;
    },
    [suppliers],
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
