
import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface Attribute {
  name: string;
  key: string;
  type: "number" | "color";
  defaultValue: number | string;
}

interface AttributePopupProps {
  objectName: string;
  attributesConfig: Attribute[];
  onClose: () => void;
  onSave: (attributes: Record<string, number | string>) => void;
}

const AttributePopup: React.FC<AttributePopupProps> = ({ objectName, attributesConfig, onClose, onSave }) => {
  const initialAttributes = attributesConfig.reduce((acc, attr) => {
    acc[attr.key] = attr.defaultValue;
    return acc;
  }, {} as Record<string, number | string>);

  const [attributes, setAttributes] = useState(initialAttributes);

  const handleInputChange = (key: string, value: string | number) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(attributes);
  };

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl p-6 z-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{objectName} Attributes</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="space-y-4">
        {attributesConfig.map((attr) => (
          <div key={attr.key} className="grid grid-cols-2 gap-2 items-center">
            <label className="text-sm font-medium text-gray-700">{attr.name}</label>
            {attr.type === "number" ? (
              <input
                type="number"
                value={attributes[attr.key] as number}
                onChange={(e) => handleInputChange(attr.key, Number(e.target.value))}
                className="border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="color"
                value={attributes[attr.key] as string}
                onChange={(e) => handleInputChange(attr.key, e.target.value)}
                className="border border-gray-300 rounded p-1 h-8 w-full"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AttributePopup;
