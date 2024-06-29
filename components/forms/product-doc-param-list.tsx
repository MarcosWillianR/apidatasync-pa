import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductDocumentationParam } from "@/hooks/useProduct";

interface ProductDocParamListProps {
  docParams: ProductDocumentationParam[];
  onChange: (changeType: string, value: string, id: number | string) => void;
  onRemove: (id: number | string) => void;
  onAddNew: () => void;
}

export function ProductDocParamList({ docParams, onChange, onRemove, onAddNew }: ProductDocParamListProps) {
  return (
    <>
      <div className="flex gap-3 items-center justify-between mb-6">
        <span className="text-md">Parâmetros</span>

        <Button type="button" size="sm" onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Novo parâmetro
        </Button>
      </div>

      {docParams.map((parameter) => (
        <div key={parameter.id} className="flex items-center gap-3 mb-4">
          <Input
            value={parameter.name}
            placeholder="Nome do parâmetro"
            onChange={(e) => onChange("name", e.target.value, parameter.id)}
          />

          <Input
            value={parameter.description}
            placeholder="Descrição do parâmetro"
            onChange={(e) => onChange("description", e.target.value, parameter.id)}
          />

          <Input
            value={parameter.type}
            placeholder="Tipo do parâmetro"
            onChange={(e) => onChange("type", e.target.value, parameter.id)}
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
