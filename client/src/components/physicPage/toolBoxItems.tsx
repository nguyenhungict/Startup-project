import React, { type JSX } from "react";

interface ItemProps {
  object: string;
  kind: "object" | "objectTool" | "globalTool" | "subtopic";
  onObjectSelect: (item: string) => void;
  isSelected: boolean;
}

const icons: { [key: string]: JSX.Element } = {
  movingobject: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
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
  default: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M2 12h20" />
    </svg>
  ),
};

const Item: React.FC<ItemProps> = ({ object, onObjectSelect }) => {
  return (
    <div
      onClick={() => onObjectSelect(object)}
      className={`
        flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ease-in-out
        cursor-pointer text-gray-700
        hover:bg-gray-100 hover:text-blue-600
      `}
      style={{ minWidth: "5rem" }}
    >
      <div className="w-6 h-6 flex items-center justify-center mb-1">
        {icons[object.toLowerCase().replace(/\s+/g, "")] || icons.default}
      </div>
      <span className="text-xs font-medium text-center whitespace-nowrap overflow-hidden text-ellipsis">
        {object}
      </span>
    </div>
  );
};

export default Item;
