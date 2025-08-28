// src/components/physicPage/attributePopup.tsx
import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import type { Attribute } from "../../data/physicConfig";

interface AttributePopupProps {
  objectName: string;
  attributesConfig: Attribute[];
  attributes: Record<string, number | string | boolean | { x: number; y: number }>;
  onChange: (key: string, value: number | string | boolean | { x: number; y: number }) => void;
  onClose: () => void;
  onSave: (attributes: Record<string, number | string | boolean | { x: number; y: number }>) => void;
}

const AttributePopup: React.FC<AttributePopupProps> = ({
  objectName,
  attributesConfig,
  attributes,
  onChange,
  onClose,
  onSave,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAttribute = (attr: Attribute, value: number | string | boolean | { x: number; y: number }) => {
    if (attr.type === "number" && typeof value === "number") {
      if (attr.min !== undefined && value < attr.min) return `Must be at least ${attr.min}`;
      if (attr.max !== undefined && value > attr.max) return `Must be at most ${attr.max}`;
    }
    if (attr.type === "position" && typeof value === "object" && "x" in value && "y" in value) {
      if (attr.min !== undefined && (value.x < attr.min || value.y < attr.min)) return `Position values must be at least ${attr.min}`;
      if (attr.max !== undefined && (value.x > attr.max || value.y > attr.max)) return `Position values must be at most ${attr.max}`;
    }
    return "";
  };

  const handleChange = (key: string, value: number | string | boolean | { x: number; y: number }) => {
    onChange(key, value);
    const attr = attributesConfig.find((a) => a.key === key);
    if (attr) {
      const error = validateAttribute(attr, value);
      setErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  const handlePositionChange = (key: string, axis: "x" | "y", inputValue: string) => {
    const numValue = Number(inputValue);
    if (isNaN(numValue)) return;
    const currentPosition = (attributes[key] as { x: number; y: number }) || { x: 0, y: 0 };
    const newPosition = { ...currentPosition, [axis]: numValue };
    handleChange(key, newPosition);
  };

  const hasErrors = Object.values(errors).some((error) => error !== "");

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
            <div className="relative">
              {attr.type === "number" ? (
                <input
                  type="number"
                  value={attributes[attr.key] as number}
                  onChange={(e) => handleChange(attr.key, Number(e.target.value))}
                  min={attr.min}
                  max={attr.max}
                  step={attr.step}
                  className={`border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[attr.key] ? "border-red-500" : ""
                  }`}
                />
              ) : attr.type === "color" ? (
                <input
                  type="color"
                  value={attributes[attr.key] as string}
                  onChange={(e) => handleChange(attr.key, e.target.value)}
                  className="border border-gray-300 rounded p-1 h-8 w-full"
                />
              ) : attr.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={attributes[attr.key] as boolean}
                  onChange={(e) => handleChange(attr.key, e.target.checked)}
                  className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
              ) : attr.type === "string" ? (
                <input
                  type="text"
                  value={attributes[attr.key] as string}
                  onChange={(e) => handleChange(attr.key, e.target.value)}
                  className={`border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[attr.key] ? "border-red-500" : ""
                  }`}
                />
              ) : attr.type === "select" && attr.options ? (
                <select
                  value={attributes[attr.key] as string}
                  onChange={(e) => handleChange(attr.key, e.target.value)}
                  className="border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {attr.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : attr.type === "position" ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={(attributes[attr.key] as { x: number; y: number } | undefined)?.x ?? 0}
                    onChange={(e) => handlePositionChange(attr.key, "x", e.target.value)}
                    min={attr.min}
                    max={attr.max}
                    step={attr.step}
                    className={`border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/2 ${
                      errors[attr.key] ? "border-red-500" : ""
                    }`}
                    placeholder="X"
                  />
                  <input
                    type="number"
                    value={(attributes[attr.key] as { x: number; y: number } | undefined)?.y ?? 0}
                    onChange={(e) => handlePositionChange(attr.key, "y", e.target.value)}
                    min={attr.min}
                    max={attr.max}
                    step={attr.step}
                    className={`border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/2 ${
                      errors[attr.key] ? "border-red-500" : ""
                    }`}
                    placeholder="Y"
                  />
                </div>
              ) : null}
              {errors[attr.key] && (
                <p className="text-red-500 text-xs mt-1">{errors[attr.key]}</p>
              )}
            </div>
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
          onClick={() => onSave(attributes)}
          disabled={hasErrors}
          className={`px-3 py-1 rounded text-sm text-white ${
            hasErrors ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AttributePopup;