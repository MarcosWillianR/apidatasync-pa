import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { Checkbox } from "@/components/ui/checkbox";

export interface StandardResponseItem {
  id: string;
  key: string;
  value: string;
}

interface SupplierStandardResponseListProps {
  standardResponses: StandardResponseItem[];
  onChange: (type: "key" | "value", value: string, id: string) => void;
  onRemove: (id: string) => void;
  onAddNew: () => void;
}

export function SupplierStandardResponseList({
  standardResponses,
  onChange,
  onRemove,
  onAddNew,
}: SupplierStandardResponseListProps) {
  return (
    <>
      <Separator />

      <div className="flex gap-3 items-center justify-between">
        <span className="text-lg">Resposta padrão</span>

        <Button type="button" onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </div>

      {standardResponses.map(({ id, key, value }) => (
        <div key={id} className="flex items-center gap-3 mb-4">
          <Input
            value={key}
            placeholder="chave"
            onChange={(e) => onChange("key", e.target.value, id)}
          />

          <Input
            value={value}
            placeholder="value"
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
