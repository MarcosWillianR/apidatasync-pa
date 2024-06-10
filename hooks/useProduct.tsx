import React, { useCallback, useState, createContext, useContext } from "react";

import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "./useSupplier";

export interface Product {
  id: number;
  name: string;
  supplierList: Supplier[];
  totalPrice: number;
  totalCost: number;
}

interface ProductContextProps {
  products: Product[] | null;
  getProducts: () => Promise<void>;
  getProduct: (id: number) => Product | null;
  isLoading: boolean;
  deleteProduct: (id: number) => Promise<void>;
  isDeletingProduct: boolean;
}

const ProductContext = createContext<ProductContextProps>(
  {} as ProductContextProps,
);

function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const { toast } = useToast();

  const getProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("product");
      setProducts(data.content);
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

  const getProduct = useCallback(
    (id: number) => {
      const product = products?.find((product) => product.id === id);
      return product || null;
    },
    [products],
  );

  const deleteProduct = useCallback(
    async (id: number) => {
      try {
        setIsDeletingProduct(true);
        await api.delete(`product/${id}`);

        setProducts(
          (currentProducts) =>
            currentProducts?.filter((product) => product.id !== id) || null,
        );

        toast({
          title: "Sucesso!",
          description: "Produto removido com sucesso.",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Ops, houve um problema.",
          description: error,
        });
      } finally {
        setIsDeletingProduct(false);
      }
    },
    [toast],
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
