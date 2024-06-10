import BreadCrumb from "@/components/breadcrumb";
import { ProductClient } from "@/components/tables/product-tables/client";

const breadcrumbItems = [{ title: "Produtos", link: "/dashboard/product" }];

export default function page() {
  return (
    <>
      <div className="flex-1 space-y-4  p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />
        <ProductClient />
      </div>
    </>
  );
}
