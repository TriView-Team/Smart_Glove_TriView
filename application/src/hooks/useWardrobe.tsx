import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface WardrobeItem {
  id: string;
  name: string;
  color: string;
  colorHex?: string;
  fabric: string;
  pattern: string;
  texture: string;
  size?: string;
  category: string;
  detectedAt: string;
  savedAt: string;
  notes?: string;
}

interface WardrobeContextType {
  items: WardrobeItem[];
  addItem: (item: Omit<WardrobeItem, "id" | "savedAt">) => void;
  removeItem: (id: string) => void;
}

const WardrobeContext = createContext<WardrobeContextType | null>(null);

const loadItems = (): WardrobeItem[] => {
  try {
    return JSON.parse(localStorage.getItem("triview_wardrobe") || "[]");
  } catch {
    return [];
  }
};

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WardrobeItem[]>(loadItems);

  const persist = (next: WardrobeItem[]) => {
    setItems(next);
    localStorage.setItem("triview_wardrobe", JSON.stringify(next));
  };

  const addItem = useCallback(
    (item: Omit<WardrobeItem, "id" | "savedAt">) => {
      const newItem: WardrobeItem = {
        ...item,
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
      };
      persist([newItem, ...items]);
    },
    [items]
  );

  const removeItem = useCallback(
    (id: string) => {
      persist(items.filter((i) => i.id !== id));
    },
    [items]
  );

  return (
    <WardrobeContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error("useWardrobe must be used within WardrobeProvider");
  return ctx;
};
