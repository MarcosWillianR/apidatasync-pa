"use client";
import React from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/forms/product-form";
import { ScrollArea } from "@/components/ui/scroll-area";

const breadcrumbItems = [
  { title: "Fornecedores", link: "/dashboard/supplier" },
  { title: "Novo Fornecedor", link: "/dashboard/supplier/create" },
];

export default function Page() {
  const params = useParams();

  console.log(params);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        <ProductForm initialData={null} key={null} />
      </div>
    </ScrollArea>
  );
}
