import React, { useCallback, useState, createContext, useContext } from "react";

import useAxiosAuth from "@/services/hooks/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";
import { AxiosInstance } from "axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface ArrayObjDTO {
  [key: string]: string;
}

export interface SupplierResponse {
  content: Supplier[];
  totalPages: number;
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
  filter: string;
  onChangeFilter: (newFilter: string) => void;
  deleteSupplier: (id: number) => Promise<void>;
  isDeletingSupplier: boolean;
}

interface Pagination {
  pageIndex: number;
  pageSize: number;
}

const SupplierContext = createContext<SupplierContextProps>({} as SupplierContextProps);

const fetchSuppliers = async (
  pagination: Pagination,
  filter: string,
  api: AxiosInstance,
): Promise<SupplierResponse> => {
  const { pageIndex, pageSize } = pagination;
  const response = await api.get(`supplier?page=${pageIndex}&size=${pageSize}&filter=${filter}`);
  return response.data;
};

function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [pagination, setPagination] = useState<Pagination>({ pageIndex: 0, pageSize: 10 });
  const [filter, setFilter] = useState<string>("");
  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();

  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["suppliers", pagination, filter],
    queryFn: () => fetchSuppliers(pagination, filter, axiosAuth),
    placeholderData: keepPreviousData,
  });

  const suppliers = data?.content ?? [];
  const pageCount = data?.totalPages ?? 0;

  const onChangeFilter = useCallback((newFilter: string) => setFilter(newFilter), []);

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
        await refetch();
        toast({
          title: "Sucesso!",
          description: "Fornecedor removido com sucesso.",
        });
      } finally {
        setIsDeletingSupplier(false);
      }
    },
    [axiosAuth, refetch, toast],
  );

  return (
    <SupplierContext.Provider
      value={{
        pageCount,
        suppliers,
        isLoading,
        filter,
        onChangeFilter,
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
