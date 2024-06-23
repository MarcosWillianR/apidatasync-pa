import BreadCrumb from "@/components/breadcrumb";
import { Loading } from "@/components/loading";

const breadcrumbItems = [{ title: "Produtos", link: "/dashboard/product" }];

export default async function page() {
  return (
    <>
      <div className="flex-1 space-y-4  p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />
        <Loading />
      </div>
    </>
  );
}
