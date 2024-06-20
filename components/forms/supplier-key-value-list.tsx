import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
  // enabled: boolean;
}

interface SupplierKeyValueListProps {
  list: KeyValueItem[];
  setList: Dispatch<SetStateAction<KeyValueItem[]>>;
  buttonText?: string;
  title: string;
  // onCheckedChange: (id: string) => void;
}

export function SupplierKeyValueList({ list, setList, title, buttonText = "Adicionar" }: SupplierKeyValueListProps) {
  function handleAddNewKeyValue() {
    setList((currentList) => {
      const newItem = {
        id: uuidv4(),
        key: "",
        value: "",
      };
      return [newItem, ...currentList];
    });
  }

  function handleRemoveKeyValue(id: string) {
    setList((currentList) => currentList.filter((currentItem) => currentItem.id !== id));
  }

  function handleUpdateKeyValue(type: "key" | "value", value: string, id: string) {
    setList((currentList) =>
      currentList.map((currentItem) => {
        if (currentItem.id === id) {
          const updatedItem = {
            ...currentItem,
            ...(type === "key" && { key: value }),
            ...(type === "value" && { value }),
          };

          return updatedItem;
        }

        return currentItem;
      }),
    );
  }

  return (
    <>
      <div className="flex gap-3 items-center justify-between mb-6">
        <span className="text-lg">{title}</span>

        <Button type="button" onClick={handleAddNewKeyValue}>
          <Plus className="h-4 w-4 mr-2" /> {buttonText}
        </Button>
      </div>

      {list.map(({ id, key, value }) => (
        <div key={id} className="flex items-center gap-3 mb-4">
          <Input
            value={key}
            placeholder="key"
            onChange={(e) => handleUpdateKeyValue("key", e.target.value, id)}
            // disabled={!enabled}
          />

          <Input
            value={value}
            placeholder="value"
            onChange={(e) => handleUpdateKeyValue("value", e.target.value, id)}
            // disabled={!enabled}
          />

          <div className="flex items-center gap-2">
            {/* <Checkbox checked={enabled} onCheckedChange={() => onCheckedChange(id)} /> */}

            <Button type="button" variant="destructive" onClick={() => handleRemoveKeyValue(id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}
