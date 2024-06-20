import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface Parameter {
  id: string;
  value: string;
}

interface SupplierParameterListProps {
  parameters: Parameter[];
  onChange: (value: string, id: string) => void;
  onRemove: (id: string) => void;
  onAddNew: () => void;
}

export function SupplierParameterList({ parameters, onChange, onRemove, onAddNew }: SupplierParameterListProps) {
  return (
    <>
      <div className="flex gap-3 items-center justify-between mb-6">
        <span className="text-lg">Parâmetros</span>

        <Button type="button" onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Novo parâmetro
        </Button>
      </div>

      {parameters.map((parameter) => (
        <div key={parameter.id} className="flex items-center gap-3 mb-4">
          <Input
            value={parameter.value}
            placeholder="Nome do parâmetro"
            onChange={(e) => onChange(e.target.value, parameter.id)}
          />

          <Button type="button" variant="destructive" onClick={() => onRemove(parameter.id)}>
            <Trash className="h-4 w-4 mr-2" />
            Remover
          </Button>
        </div>
      ))}
    </>
  );
}
