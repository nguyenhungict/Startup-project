// src/components/physicPage/attributePopup.tsx
import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import type { Attribute } from "../../data/physicConfig";

interface AttributePopupProps {
  objectName: string;
  attributesConfig: Attribute[];
  attributes: Record<string, number | string | boolean | { x: number | string; y: number | string }>;
  onClose: () => void;
  onSave: (attributes: Record<string, number | string | boolean | { x: number; y: number }>) => void;
}

type ParsedAttributes = Record<string, number | string | boolean | { x: number; y: number }>;

const AttributePopup: React.FC<AttributePopupProps> = ({
  objectName,
  attributesConfig,
  attributes: initialAttributes,
  onClose,
  onSave,
}) => {
  // Use local state for form data
  const [formData, setFormData] = useState<Record<string, number | string | boolean | { x: number | string; y: number | string }>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when component mounts or attributes change
  useEffect(() => {
    const initData: Record<string, number | string | boolean | { x: number | string; y: number | string }> = {};
    
    attributesConfig.forEach((attr) => {
      if (initialAttributes[attr.key] !== undefined) {
        initData[attr.key] = initialAttributes[attr.key];
      } else {
        initData[attr.key] = attr.defaultValue;
      }
    });
    
    setFormData(initData);
  }, [attributesConfig, initialAttributes]);

  const validateAttribute = (attr: Attribute, value: number | string | boolean | { x: number | string; y: number | string }, isBlurOrSave: boolean = false) => {
    if (attr.type === "number") {
      if (typeof value === "string") {
        if (value === "" && !isBlurOrSave) return ""; // Allow empty during typing
        if (value === "") return "Value cannot be empty";
        const numValue = Number(value);
        if (isNaN(numValue)) return "Invalid number";
        if (attr.min !== undefined && numValue < attr.min) return `Must be at least ${attr.min}`;
        if (attr.max !== undefined && numValue > attr.max) return `Must be at most ${attr.max}`;
      }
    }
    if (attr.type === "position" && typeof value === "object" && "x" in value && "y" in value) {
      if ((value.x === "" || value.y === "") && !isBlurOrSave) return ""; // Allow empty during typing
      if (value.x === "" || value.y === "") return "Position values cannot be empty";
      const x = typeof value.x === "string" ? Number(value.x) : value.x;
      const y = typeof value.y === "string" ? Number(value.y) : value.y;
      if (isNaN(x) || isNaN(y)) return "Invalid position values";
      if (attr.min !== undefined && (x < attr.min || y < attr.min)) return `Position values must be at least ${attr.min}`;
      if (attr.max !== undefined && (x > attr.max || y > attr.max)) return `Position values must be at most ${attr.max}`;
    }
    return "";
  };

  const handleChange = (key: string, value: number | string | boolean | { x: number | string; y: number | string }) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    
    const attr = attributesConfig.find((a) => a.key === key);
    if (attr) {
      const error = validateAttribute(attr, value);
      setErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  const handlePositionChange = (key: string, axis: "x" | "y", inputValue: string) => {
    const currentPosition = (formData[key] as { x: number | string; y: number | string } | undefined) || { x: "", y: "" };
    const newPosition = { ...currentPosition, [axis]: inputValue };
    handleChange(key, newPosition);
  };

  const handleNumberBlur = (key: string, value: string) => {
    const numValue = Number(value);
    const attr = attributesConfig.find((a) => a.key === key);
    const defaultValue = attr?.defaultValue ?? 0;
    const finalValue = value === "" || isNaN(numValue) ? defaultValue : numValue;
    handleChange(key, finalValue);
    const error = validateAttribute(attr!, finalValue, true);
    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const handlePositionBlur = (key: string, axis: "x" | "y", value: string) => {
    const numValue = Number(value);
    const currentPosition = (formData[key] as { x: number | string; y: number | string } | undefined) || { x: "", y: "" };
    const attr = attributesConfig.find((a) => a.key === key);
    const defaultPos = (attr?.defaultValue as { x: number; y: number }) ?? { x: 0, y: 0 };
    const newPosition = {
      ...currentPosition,
      [axis]: value === "" || isNaN(numValue) ? defaultPos[axis] : numValue,
    };
    handleChange(key, newPosition);
    const error = validateAttribute(attr!, newPosition, true);
    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const hasErrors = Object.values(errors).some((error) => error !== "");

  const handleSave = () => {
    const parsedAttributes = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => {
        const attr = attributesConfig.find((a) => a.key === key);
        if (attr?.type === "number" && typeof value === "string") {
          const numValue = Number(value);
          return [key, value === "" || isNaN(numValue) ? attr.defaultValue : numValue];
        }
        if (attr?.type === "position" && typeof value === "object" && "x" in value && "y" in value) {
          const defaultPos = attr.defaultValue as { x: number; y: number };
          const parsedPosition = {
            x: typeof value.x === "string" ? (value.x === "" || isNaN(Number(value.x)) ? defaultPos.x : Number(value.x)) : value.x,
            y: typeof value.y === "string" ? (value.y === "" || isNaN(Number(value.y)) ? defaultPos.y : Number(value.y)) : value.y,
          };
          return [key, parsedPosition as { x: number; y: number }];
        }
        return [key, value];
      })
    ) as ParsedAttributes;

    // Validate all fields before saving
    const newErrors: Record<string, string> = {};
    attributesConfig.forEach((attr) => {
      const value = parsedAttributes[attr.key];
      const error = validateAttribute(attr, value, true);
      if (error) newErrors[attr.key] = error;
    });

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === "")) {
      onSave(parsedAttributes);
    }
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
            <div className="relative">
              {attr.type === "number" ? (
                <input
                  type="number"
                  value={(formData[attr.key] as number | string) ?? ""}
                  onChange={(e) => handleChange(attr.key, e.target.value)}
                  onBlur={(e) => handleNumberBlur(attr.key, e.target.value)}
                  min={attr.min}
                  max={attr.max}
                  step={attr.step}
                  className={`w-full border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[attr.key] ? "border-red-500" : ""
                  }`}
                />
              ) : attr.type === "color" ? (
                <input
                  type="color"
                  value={formData[attr.key] as string}
                  onChange={(e) => handleChange(attr.key, e.target.value)}
                  className="border border-gray-300 rounded p-1 h-8 w-full"
                />
              ) : attr.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={formData[attr.key] as boolean}
                  onChange={(e) => handleChange(attr.key, e.target.checked)}
                  className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
              ) : attr.type === "string" ? (
                <input
                  type="text"
                  value={formData[attr.key] as string}
                  onChange={(e) => handleChange(attr.key, e.target.value)}
                  className={`w-full border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[attr.key] ? "border-red-500" : ""
                  }`}
                />
              ) : attr.type === "select" && attr.options ? (
                <select
                  value={formData[attr.key] as string}
                  onChange={(e) => handleChange(attr.key, e.target.value)}
                  className="w-full border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    value={((formData[attr.key] as { x: number | string; y: number | string } | undefined)?.x ?? "")}
                    onChange={(e) => handlePositionChange(attr.key, "x", e.target.value)}
                    onBlur={(e) => handlePositionBlur(attr.key, "x", e.target.value)}
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
                    value={((formData[attr.key] as { x: number | string; y: number | string } | undefined)?.y ?? "")}
                    onChange={(e) => handlePositionChange(attr.key, "y", e.target.value)}
                    onBlur={(e) => handlePositionBlur(attr.key, "y", e.target.value)}
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
          onClick={handleSave}
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