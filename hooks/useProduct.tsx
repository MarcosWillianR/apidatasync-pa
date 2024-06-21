import React, { useCallback, useState, createContext, useContext } from "react";

import useAxiosAuth from "@/services/hooks/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "./useSupplier";

interface ArrayObjDTO {
  [key: string]: string;
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
  products: Product[] | null;
  getProducts: () => Promise<void>;
  getProduct: (id: number) => Promise<Product | null>;
  isLoading: boolean;
  deleteProduct: (id: number) => Promise<void>;
  isDeletingProduct: boolean;
}

const ProductContext = createContext<ProductContextProps>({} as ProductContextProps);

function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();

  const getProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosAuth.get("product");
      setProducts(data.content);
    } finally {
      setIsLoading(false);
    }
  }, [axiosAuth]);

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

        console.log(id);

        setProducts((currentProducts) => currentProducts?.filter((product) => product.id !== id) || null);

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
        getProducts,
        getProduct,
        isLoading,
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
