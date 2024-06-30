import React, { useCallback, useState, createContext, useContext } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "./useSupplier";
import useAxiosAuth from "@/services/hooks/useAxiosAuth";
import { AxiosInstance } from "axios";

interface ArrayObjDTO {
  [key: string]: string;
}

export interface ProductsResponse {
  content: Product[];
  totalPages: number;
}

export interface Product {
  id: number;
  name: string;
  suppliersCount: number;
  totalPrice: number;
  totalCost: number;
}

export interface ProductDocumentationParam {
  id: number | string;
  name: string;
  description: string;
  type: string;
}

interface ProductDocumentation {
  title: string;
  description: string;
  curl: string;
  params: ProductDocumentationParam[];
}

export interface ProductDetail {
  id: number;
  name: string;
  standardResponse: ArrayObjDTO;
  supplierList: Supplier[];
  totalPrice: number;
  totalCost: number;
  doc: ProductDocumentation;
}

interface Pagination {
  pageIndex: number;
  pageSize: number;
}

interface ProductContextProps {
  products: Product[];
  pageCount: number | undefined;
  getProduct: (id: number) => Promise<ProductDetail | null>;
  deleteProduct: (id: number) => Promise<void>;
  isDeletingProduct: boolean;
  pagination: Pagination;
  setPagination: React.Dispatch<React.SetStateAction<Pagination>>;
  filter: string;
  onChangeFilter: (newFilter: string) => void;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextProps>({} as ProductContextProps);

const fetchProducts = async (pagination: Pagination, filter: string, api: AxiosInstance): Promise<ProductsResponse> => {
  const { pageIndex, pageSize } = pagination;
  const response = await api.get(`product/minimal?page=${pageIndex}&size=${pageSize}&filter=${filter}`);
  return response.data;
};

function ProductProvider({ children }: { children: React.ReactNode }) {
  const [pagination, setPagination] = useState<Pagination>({ pageIndex: 0, pageSize: 10 });
  const [filter, setFilter] = useState<string>("");
  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();

  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", pagination, filter],
    queryFn: () => fetchProducts(pagination, filter, axiosAuth),
    placeholderData: keepPreviousData,
  });

  const products = data?.content ?? [];
  const pageCount = data?.totalPages ?? 0;

  const onChangeFilter = useCallback((newFilter: string) => setFilter(newFilter), []);

  const getProduct = useCallback(
    async (id: number) => {
      const { data } = await axiosAuth.get(`product/details/${id}`);
      return data || null;
    },
    [axiosAuth],
  );

  const deleteProduct = useCallback(
    async (id: number) => {
      try {
        setIsDeletingProduct(true);
        await axiosAuth.delete(`product/${id}`);
        await refetch();
        toast({
          title: "Sucesso!",
          description: "Produto removido com sucesso.",
        });
      } finally {
        setIsDeletingProduct(false);
      }
    },
    [axiosAuth, refetch, toast],
  );

  return (
    <ProductContext.Provider
      value={{
        products,
        pageCount,
        pagination,
        setPagination,
        filter,
        onChangeFilter,
        isLoading,
        getProduct,
        deleteProduct,
        isDeletingProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

function useProduct() {
  const context = useContext(ProductContext);
  return context;
}

export { ProductProvider, useProduct };
