import React from "react";

interface NavItemProps {
  topicId: string;
  label: string;
  icon: React.ReactNode;
  onSelect: (topicId: string) => void;
  isSelected?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ topicId, label, icon, onSelect, isSelected = false }) => {
  return (
    <button
      className={`w-full p-3 flex items-center rounded-lg transition-colors ${
        isSelected ? "bg-amber-100 text-amber-600" : "text-gray-500 hover:bg-amber-50 hover:text-amber-600"
      }`}
      onClick={() => onSelect(topicId)}
      aria-label={`Select ${label} topic`}
    >
      <span className="flex justify-center w-10">{icon}</span>
      <span className="ml-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        {label}
      </span>
    </button>
  );
};

export default NavItem;