"use client";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useProduct } from "@/hooks/useProduct";
import { Loading } from "@/components/loading";

export const ProductClient = () => {
  const router = useRouter();
  const { products, pagination, setPagination, isLoading, getProducts, pageCount } = useProduct();

  useEffect(() => {
    getProducts();
  }, [getProducts]);

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

      {!isLoading && products.length > 0 && (
        <DataTable
          searchKey="name"
          searchPlaceholder="Buscar por nome..."
          columns={columns}
          data={products}
          pageCount={pageCount}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}

      {!isLoading && products.length === 0 && (
        <Table className="relative">
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Sem produtos cadastrados.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </>
  );
};
