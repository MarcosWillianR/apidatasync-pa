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
  supplierList: Supplier[];
  totalPrice: number;
  totalCost: number;
  standardResponse: ArrayObjDTO | null;
}

interface ProductContextProps {
  products: Product[];
  getProduct: (id: number) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<void>;
  setInitialProducts: (products: Product[]) => void;
  isDeletingProduct: boolean;
}

const ProductContext = createContext<ProductContextProps>({} as ProductContextProps);

function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();

  const setInitialProducts = useCallback((initialProducts: Product[]) => {
    setProducts(initialProducts);
  }, []);

  const getProduct = useCallback(
    async (id: number) => {
      const { data } = await axiosAuth.get(`product/${id}`);
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
        setInitialProducts,
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
