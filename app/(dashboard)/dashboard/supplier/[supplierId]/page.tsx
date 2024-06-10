"use client";
import React from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/forms/supplier-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupplier } from "@/hooks/useSupplier";

const breadcrumbItems = [
  { title: "Fornecedores", link: "/dashboard/supplier" },
  { title: "Novo Fornecedor", link: "/dashboard/supplier/create" },
];

export default function Page() {
  const params = useParams<{ supplierId: string }>();
  const { getSupplier } = useSupplier();

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        <ProductForm initialData={getSupplier(Number(params.supplierId))} />
      </div>
    </ScrollArea>
  );
}
