"use client";

import { trpc } from "@/trpc/client";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
}

export function SearchCommand({ open, onOpenChange, onSelect }: SearchCommandProps) {
  const { data: history } = trpc.generation.getHistory.useQuery(
    { limit: 50 },
    { enabled: open }
  );

  const handleSelect = (id: string) => {
    onSelect(id);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search presentations"
      description="Search your presentation history"
      className="sm:max-w-[550px] w-full"
    >
      <Command>
        <CommandInput placeholder="Search presentations..." autoFocus />
        <CommandList>
          <CommandEmpty>No presentations found.</CommandEmpty>
          {history && history.length > 0 && (
            <CommandGroup heading="Recent">
              {history.map((item) => {
                const title =
                  item.generatedJson && (item.generatedJson as any).title
                    ? (item.generatedJson as any).title
                    : item.topic;
                return (
                  <CommandItem
                    key={item.id}
                    value={title}
                    onSelect={() => handleSelect(item.id)}
                    className="cursor-pointer px-4 py-3 rounded-lg bg-transparent data-selected:bg-transparent hover:bg-secondary/20 data-selected:hover:bg-secondary/20 text-sm transition-colors"
                  >
                    <span className="truncate">{title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

