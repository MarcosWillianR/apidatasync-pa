import { Plus, Trash } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface RequestBodyItem {
  id: string;
  key: string;
  value: string;
}

interface SupplierRequestBodyListProps {
  requestBodies: RequestBodyItem[];
  onChange: (type: "key" | "value", value: string, id: string) => void;
  onRemove: (id: string) => void;
  onAddNew: () => void;
  currentBodyFormatter: string;
  onChangeCurrentBodyFormatter: (value: string) => void;
}

export function SupplierRequestBodyList({
  requestBodies,
  onChange,
  onRemove,
  onAddNew,
  currentBodyFormatter,
  onChangeCurrentBodyFormatter,
}: SupplierRequestBodyListProps) {
  return (
    <>
      <Separator />

      <div className="flex gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">Corpo requisição</span>

          <Tabs
            defaultValue="json"
            value={currentBodyFormatter}
            onValueChange={onChangeCurrentBodyFormatter}
          >
            <TabsList>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="xml">XML</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button type="button" onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </div>

      {requestBodies.map(({ id, key, value }) => (
        <div key={id} className="flex items-center gap-3 mb-4">
          <Input
            value={key}
            placeholder="chave"
            onChange={(e) => onChange("key", e.target.value, id)}
          />

          <Input
            value={value}
            placeholder="valor"
            onChange={(e) => onChange("value", e.target.value, id)}
          />

          <div className="flex items-center gap-2">
            <Button type="button" variant="destructive" onClick={() => onRemove(id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}
