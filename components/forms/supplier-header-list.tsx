import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { Checkbox } from "@/components/ui/checkbox";

export interface HeaderItem {
  id: string;
  header: string;
  value: string;
  enabled: boolean;
}

interface SupplierHeaderListProps {
  headers: HeaderItem[];
  onChange: (type: "header" | "value", value: string, id: string) => void;
  onRemove: (id: string) => void;
  onAddNew: () => void;
  // onCheckedChange: (id: string) => void;
}

export function SupplierHeaderList({
  headers,
  onChange,
  onRemove,
  onAddNew, // onCheckedChange,
}: SupplierHeaderListProps) {
  return (
    <>
      <Separator />

      <div className="flex gap-3 items-center justify-between">
        <span className="text-lg">Headers</span>

        <Button type="button" onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Novo header
        </Button>
      </div>

      {headers.map(({ id, enabled, header, value }) => (
        <div key={id} className="flex items-center gap-3 mb-4">
          <Input
            value={header}
            placeholder="header"
            onChange={(e) => onChange("header", e.target.value, id)}
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
