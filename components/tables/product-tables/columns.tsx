"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";
import { Product } from "@/hooks/useProduct";

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "NOME",
  },
  {
    accessorKey: "suppliersCount",
    header: "FORNECEDORES",
    cell: ({ cell, row }) => {
      return <div>{row.original.suppliersCount} Fornecedor(es)</div>;
    },
  },
  {
    accessorKey: "totalPrice",
    header: "PREÇO TOTAL",
  },
  {
    accessorKey: "totalCost",
    header: "CUSTO TOTAL",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
