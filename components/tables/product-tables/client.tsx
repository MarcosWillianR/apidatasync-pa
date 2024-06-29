"use client";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useProduct } from "@/hooks/useProduct";
import { Loading } from "@/components/loading";

export const ProductClient = () => {
  const router = useRouter();
  const { products, pagination, setPagination, isLoading, getProducts, pageCount, filter, onChangeFilter } =
    useProduct();

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Produtos (${products?.length ?? "-"})`}
          description="Gerencie produtos (Funcionalidades de cadastro, visualização e remoção.)"
        />
        <Button className="text-xs md:text-sm" onClick={() => router.push(`/dashboard/product/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <Separator />

      {isLoading && <Loading />}

      {!isLoading && (
        <DataTable
          searchPlaceholder="Buscar por nome ou fornecedor..."
          filter={filter}
          onChangeFilter={onChangeFilter}
          columns={columns}
          data={products}
          pageCount={pageCount}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}
    </>
  );
};
