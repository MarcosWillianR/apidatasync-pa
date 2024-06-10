"use client";
import React from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/forms/product-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProduct } from "@/hooks/useProduct";

const breadcrumbItems = [
  { title: "Produtos", link: "/dashboard/product" },
  { title: "Novo Produto", link: "/dashboard/product/create" },
];

export default function Page() {
  const params = useParams<{ productId: string }>();
  const { getProduct } = useProduct();

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        <ProductForm initialData={getProduct(Number(params.productId))} />
      </div>
    </ScrollArea>
  );
}
