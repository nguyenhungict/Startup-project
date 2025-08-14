import React, { useState } from "react";

interface AttributePopupProps {
  objectName: string;
  onClose: () => void;
  onSave: (attributes: { size: number; color: string }) => void;
}

const AttributePopup: React.FC<AttributePopupProps> = ({ objectName, onClose, onSave }) => {
  const [size, setSize] = useState(10);
  const [color, setColor] = useState("#000000");

  const handleSave = () => {
    onSave({ size, color });
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg w-64 z-10">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
      >
        ×
      </button>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Attributes for {objectName}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Size</label>
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AttributePopup;