"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Product, useProduct } from "@/hooks/useProduct";
import { Loading } from "@/components/loading";
interface ProductClientProps {
  initialProducts: Product[];
}

export const ProductClient = ({ initialProducts }: ProductClientProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { products, setInitialProducts } = useProduct();

  useEffect(() => {
    setInitialProducts(initialProducts);
    setIsLoading(false);
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

      {!isLoading && products.length > 0 && (
        <DataTable searchKey="name" searchPlaceholder="Buscar por nome..." columns={columns} data={products} />
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
