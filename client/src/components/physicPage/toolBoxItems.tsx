import React, { type JSX } from "react";

interface ItemProps {
  object: string;
  onObjectSelect: (object: string) => void;
}

// Simple SVG icons for each object (replace with actual icons or icon library as needed)
const icons: { [key: string]: JSX.Element } = {
  circle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  square: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" />
    </svg>
  ),
  triangle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12,2 22,22 2,22" />
    </svg>
  ),
  // Add more icons for other objects as needed
  default: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M2 12h20" />
    </svg>
  ),
};

const Item: React.FC<ItemProps> = ({ object, onObjectSelect }) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, object: string) => {
    event.dataTransfer.setData("text/plain", object);
    onObjectSelect(object);
  };

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, object)}
      onClick={() => onObjectSelect(object)}
      className="flex flex-col items-center p-2 cursor-pointer hover:bg-gray-100"
    >
      <div className="w-8 h-8 flex items-center justify-center">
        {icons[object.toLowerCase()] || icons.default}
      </div>
      <span className="text-xs mt-1 text-center">{object}</span>
    </div>
  );
};

export default Item;