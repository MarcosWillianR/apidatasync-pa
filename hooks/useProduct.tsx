import React, { useCallback, useState, createContext, useContext } from "react";

import useAxiosAuth from "@/services/hooks/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "./useSupplier";

interface ArrayObjDTO {
  [key: string]: string;
}

export interface ProductsResponse {
  content: Product[];
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
  onChangeFilter: (newFilter: string) => Promise<void>;
  isLoading: boolean;
  getProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextProps>({} as ProductContextProps);

function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ pageIndex: 0, pageSize: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();

  const getProducts = useCallback(
    async (newFilter = "") => {
      setIsLoading(true);
      setFilter(newFilter);
      const { data } = await axiosAuth.get(
        `product/minimal?page=${pagination.pageIndex}&size=${pagination.pageSize}&filter=${newFilter}`,
      );
      setProducts(data.content);
      setPageCount(data.totalPages);
      setIsLoading(false);
    },
    [axiosAuth, pagination.pageIndex, pagination.pageSize],
  );

  const handleChangeFilter = useCallback(async (newFilter: string) => {
    await getProducts(newFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        setProducts((currentProducts) => currentProducts.filter((currentProduct) => currentProduct.id !== id));
        toast({
          title: "Sucesso!",
          description: "Produto removido com sucesso.",
        });
      } finally {
        setIsDeletingProduct(false);
      }
    },
    [axiosAuth, toast],
  );

  return (
    <ProductContext.Provider
      value={{
        products,
        pageCount,
        getProducts,
        filter,
        onChangeFilter: handleChangeFilter,
        isLoading,
        getProduct,
        deleteProduct,
        isDeletingProduct,
        pagination,
        setPagination,
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
