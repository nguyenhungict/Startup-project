import React from "react";

interface NavItemProps {
  topicId: string;
  icon: React.ReactNode;
  onSelect: (topicId: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ topicId, icon, onSelect }) => {
  return (
    <button
      className="w-full p-3 flex justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
      onClick={() => onSelect(topicId)}
    >
      {icon}
    </button>
  );
};

export default NavItem;