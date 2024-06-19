"use client";
import React, { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/forms/supplier-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Supplier, useSupplier } from "@/hooks/useSupplier";

const breadcrumbItems = [
  { title: "Fornecedores", link: "/dashboard/supplier" },
  { title: "Novo Fornecedor", link: "/dashboard/supplier/create" },
];

export default function Page() {
  const params = useParams<{ supplierId: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const { getSupplier, isLoading } = useSupplier();

  useEffect(() => {
    async function getSupplierData() {
      const response = await getSupplier(Number(params.supplierId));
      setSupplier(response);
    }

    if (params.supplierId) getSupplierData();
  }, [getSupplier, params.supplierId]);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />

        {isLoading ? (
          <div>Carregando...</div>
        ) : (
          <ProductForm initialData={supplier} />
        )}
      </div>
    </ScrollArea>
  );
}
