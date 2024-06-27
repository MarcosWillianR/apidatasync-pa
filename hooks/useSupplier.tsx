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
  suppliers: Supplier[];
  pageCount: number | undefined;
  getSupplier: (id: number) => Promise<Supplier | null>;
  isLoading: boolean;
  pagination: Pagination;
  setPagination: React.Dispatch<React.SetStateAction<Pagination>>;
  getSuppliers: () => Promise<void>;
  deleteSupplier: (id: number) => Promise<void>;
  isDeletingSupplier: boolean;
}

interface Pagination {
  pageIndex: number;
  pageSize: number;
}

const SupplierContext = createContext<SupplierContextProps>({} as SupplierContextProps);

function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ pageIndex: 0, pageSize: 10 });
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();

  const getSuppliers = useCallback(async () => {
    setIsLoading(true);
    const { data } = await axiosAuth.get(`supplier?page=${pagination.pageIndex}&size=${pagination.pageSize}`);
    setSuppliers(data.content);
    setPageCount(data.totalPages);
    setIsLoading(false);
  }, [axiosAuth, pagination.pageIndex, pagination.pageSize, setIsLoading]);

  const getSupplier = useCallback(
    async (id: number) => {
      const { data } = await axiosAuth.get(`supplier/${id}`);
      return data || null;
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
        pageCount,
        suppliers,
        getSuppliers,
        isLoading,
        getSupplier,
        deleteSupplier,
        isDeletingSupplier,
        pagination,
        setPagination,
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
