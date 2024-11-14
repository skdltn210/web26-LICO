import { useState, useEffect, KeyboardEvent, useMemo } from 'react';

interface UseSearchProps<T> {
  items: T[] | undefined;
  searchKey: keyof T;
  onSelect?: (item: T) => void;
}

interface UseSearchReturn<T> {
  searchValue: string;
  setSearchValue: (value: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  filteredItems: T[];
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleSelect: (item: T) => void;
}

export const useSearch = <T extends object>({ items, searchKey, onSelect }: UseSearchProps<T>): UseSearchReturn<T> => {
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredItems = useMemo(
    () => items?.filter(item => String(item[searchKey]).toLowerCase().includes(searchValue.toLowerCase())) ?? [],
    [items, searchKey, searchValue],
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchValue]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredItems?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  const handleSelect = (item: T) => {
    onSelect?.(item);
    setSearchValue('');
    setShowDropdown(false);
    setHighlightedIndex(0);
  };

  return {
    searchValue,
    setSearchValue,
    showDropdown,
    setShowDropdown,
    highlightedIndex,
    setHighlightedIndex,
    filteredItems,
    handleKeyDown,
    handleSelect,
  };
};
