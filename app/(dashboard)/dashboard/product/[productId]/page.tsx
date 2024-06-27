"use client";
import React, { useState, useEffect } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/forms/product-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductDetail, useProduct } from "@/hooks/useProduct";
import { useSupplier } from "@/hooks/useSupplier";
import { Loading } from "@/components/loading";

const breadcrumbItems = [
  { title: "Produtos", link: "/dashboard/product" },
  { title: "Novo Produto", link: "/dashboard/product/create" },
];

export default function Page() {
  const params = useParams<{ productId: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!Number(params.productId));
  const { suppliers, getSuppliers, isLoading: isLoadingSuppliers } = useSupplier();
  const { getProduct } = useProduct();

  useEffect(() => {
    async function getProductData() {
      try {
        const response = await getProduct(Number(params.productId));
        setProduct(response);
      } finally {
        setIsLoading(false);
      }
    }

    if (Number(params.productId)) {
      getProductData();
    }
  }, [getProduct, params.productId]);

  useEffect(() => {
    getSuppliers();
  }, [getSuppliers]);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />

        {isLoading || isLoadingSuppliers ? <Loading /> : <ProductForm initialData={product} suppliers={suppliers} />}
      </div>
    </ScrollArea>
  );
}
