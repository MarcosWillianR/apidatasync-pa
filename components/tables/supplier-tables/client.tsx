"use client";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/loading";
import { useSupplier } from "@/hooks/useSupplier";
import { columns } from "./columns";

export const SupplierClient = () => {
  const router = useRouter();
  const { suppliers, pagination, setPagination, isLoading, getSuppliers, pageCount, filter, onChangeFilter } =
    useSupplier();

  useEffect(() => {
    getSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Fornecedores (${suppliers?.length ?? "-"})`}
          description="Gerencie fornecedores (Funcionalidades de cadastro, visualização e remoção.)"
        />
        <Button className="text-xs md:text-sm" onClick={() => router.push(`/dashboard/supplier/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>
      <Separator />

      {isLoading && <Loading />}

      {!isLoading && (
        <DataTable
          filter={filter}
          onChangeFilter={onChangeFilter}
          searchPlaceholder="Buscar por nome, escopo..."
          columns={columns}
          data={suppliers}
          pageCount={pageCount}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}
    </>
  );
};
