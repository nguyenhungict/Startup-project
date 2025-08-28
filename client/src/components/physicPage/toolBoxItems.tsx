import React, { type JSX } from "react";

interface ItemProps {
  object: string;
  onObjectSelect: (item: string) => void;
  isSelected: boolean;
}

const icons: { [key: string]: JSX.Element } = {
  sphere: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  block: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" />
    </svg>
  ),
  box: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" />
    </svg>
  ),
  ramp: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="2,22 22,22 12,2" />
    </svg>
  ),
  spring: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4l3 2-3 2v4l3 2-3 2v4" />
    </svg>
  ),
  rope: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  ),
  wall: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="8" width="20" height="8" />
    </svg>
  ),
  gravity: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v18m-4 0l4 4m4-4l-4 4" />
    </svg>
  ),
  friction: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12h20m-10-4l4 4m-4 4l4-4" />
    </svg>
  ),
  external: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12h18m-4-4l4 4m-4 4l4-4" />
    </svg>
  ),
  airresistance: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12c2-4 4-6 10-6s10 2 10 6-4 6-10 6-10-2-10-6" />
    </svg>
  ),
  springforce: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4l3 2-3 2v4l3 2-3 2v4" />
    </svg>
  ),
  default: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M2 12h20" />
    </svg>
  ),
};

const Item: React.FC<ItemProps> = ({ object, onObjectSelect, isSelected }) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, item: string) => {
    event.dataTransfer.setData("text/plain", item);
    onObjectSelect(item);
  };

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, object)}
      onClick={() => onObjectSelect(object)}
      className={`flex flex-col items-center p-2 cursor-pointer hover:bg-gray-100 ${
        isSelected ? "bg-blue-100 border border-blue-500" : ""
      }`}
    >
      <div className="w-8 h-8 flex items-center justify-center">
        {icons[object.toLowerCase()] || icons.default}
      </div>
      <span className="text-xs mt-1 text-center">{object}</span>
    </div>
  );
};

export default Item;