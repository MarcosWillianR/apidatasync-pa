import BreadCrumb from "@/components/breadcrumb";
import { SupplierClient } from "@/components/tables/supplier-tables/client";
import { AuthGetApi } from "@/services/fetchApi";

const breadcrumbItems = [{ title: "Fornecedores", link: "/dashboard/supplier" }];

export default async function page() {
  const suppliersResponse = await AuthGetApi("supplier");

  return (
    <>
      <div className="flex-1 space-y-4  p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />
        <SupplierClient initialSuppliers={suppliersResponse.content} />
      </div>
    </>
  );
}
