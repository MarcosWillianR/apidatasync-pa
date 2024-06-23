import { AuthGetApi } from "@/services/fetchApi";
import BreadCrumb from "@/components/breadcrumb";
import { ProductClient } from "@/components/tables/product-tables/client";
import { ProductsResponse } from "@/hooks/useProduct";

const breadcrumbItems = [{ title: "Produtos", link: "/dashboard/product" }];

export default async function page() {
  const productsResponse: ProductsResponse = await AuthGetApi("product");
  return (
    <>
      <div className="flex-1 space-y-4  p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />
        <ProductClient initialProducts={productsResponse.content} />
      </div>
    </>
  );
}
