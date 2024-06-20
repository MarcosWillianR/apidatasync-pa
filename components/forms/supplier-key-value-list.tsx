import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { Checkbox } from "@/components/ui/checkbox";

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
  // enabled: boolean;
}

interface SupplierKeyValueListProps {
  list: KeyValueItem[];
  onChange: (type: "key" | "value", value: string, id: string) => void;
  onRemove: (id: string) => void;
  onAddNew: () => void;
  // onCheckedChange: (id: string) => void;
  buttonText?: string;
  title: string;
}

export function SupplierKeyValueList({
  list,
  onChange,
  onRemove,
  onAddNew,
  title,
  buttonText = "Adicionar",
}: SupplierKeyValueListProps) {
  return (
    <>
      <div className="flex gap-3 items-center justify-between mb-6">
        <span className="text-lg">{title}</span>

        <Button type="button" onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" /> {buttonText}
        </Button>
      </div>

      {list.map(({ id, key, value }) => (
        <div key={id} className="flex items-center gap-3 mb-4">
          <Input
            value={key}
            placeholder="key"
            onChange={(e) => onChange("key", e.target.value, id)}
            // disabled={!enabled}
          />

          <Input
            value={value}
            placeholder="value"
            onChange={(e) => onChange("value", e.target.value, id)}
            // disabled={!enabled}
          />

          <div className="flex items-center gap-2">
            {/* <Checkbox checked={enabled} onCheckedChange={() => onCheckedChange(id)} /> */}

            <Button type="button" variant="destructive" onClick={() => onRemove(id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}
