import { useEffect, useRef } from 'react';

interface DropdownProps<T> {
  show: boolean;
  items: T[];
  highlightedIndex: number;
  onSelect: (item: T) => void;
  onHighlight: (index: number) => void;
  renderItem: (item: T) => React.ReactNode;
}

export default function Dropdown<T>({
  show,
  items,
  highlightedIndex,
  onSelect,
  onHighlight,
  renderItem,
}: DropdownProps<T>) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!listRef.current || !show) return;

    const list = listRef.current;
    const items = list.getElementsByTagName('li');
    const highlighted = items[highlightedIndex];

    if (highlighted) {
      const listHeight = list.clientHeight;
      const itemHeight = highlighted.clientHeight || 0;
      const scrollTop = list.scrollTop;
      const itemTop = highlighted.offsetTop;

      if (itemTop < scrollTop) {
        list.scrollTop = itemTop;
      } else if (itemTop + itemHeight > scrollTop + listHeight) {
        list.scrollTop = itemTop + itemHeight - listHeight;
      }
    }
  }, [highlightedIndex, show]);

  if (!show || items.length === 0) return null;

  return (
    <div className="absolute top-full z-10 mt-1 w-full rounded-lg bg-lico-gray-5 shadow-lg">
      <ul ref={listRef} className="max-h-60 overflow-auto scroll-smooth py-1">
        {items.map((item, index) => (
          <li
            key={index}
            className={`cursor-pointer px-4 py-2 ${
              index === highlightedIndex ? 'bg-lico-gray-4' : 'hover:bg-lico-gray-4'
            }`}
            onClick={() => onSelect(item)}
            onMouseEnter={() => onHighlight(index)}
          >
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}
