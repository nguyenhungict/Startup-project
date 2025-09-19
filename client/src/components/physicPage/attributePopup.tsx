// src/components/physicPage/attributePopup.tsx
import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import type { Attribute } from "../../data/physicConfig";

interface AttributePopupProps {
  objectName: string;
  attributesConfig: Attribute[];
  attributes: Record<string, any>;
  tools?: {
    id: string;
    name: string;
    attributesConfig: Attribute[];
    attributes: Record<string, any>;
  }[];
  onClose: () => void;
  onSave: (data: {
    attributes: Record<string, number | string | boolean | { x: number; y: number }>;
    tools: { id: string; attributes: Record<string, number | string | boolean | { x: number; y: number }> }[];
  }) => void;
}

type ParsedAttributes = Record<string, number | string | boolean | { x: number; y: number }>;

const AttributePopup: React.FC<AttributePopupProps> = ({
  objectName,
  attributesConfig,
  attributes: initialAttributes,
  tools = [],
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({ object: {}, tools: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log("AttributePopup useEffect", { initialAttributes, tools });
    const initObj: ParsedAttributes = {};
    attributesConfig.forEach((attr) => {
      const value = initialAttributes[attr.key] ?? attr.defaultValue;
      initObj[attr.key] = attr.type === "number" ? Number(value) || attr.defaultValue : value;
    });

    const initTools: { id: string; attributes: ParsedAttributes }[] = tools.map((t) => {
      const initT: ParsedAttributes = {};
      t.attributesConfig.forEach((a) => {
        const value = t.attributes[a.key] ?? a.defaultValue;
        initT[a.key] = a.type === "number" ? Number(value) || a.defaultValue : value;
      });
      return { id: t.id, attributes: initT };
    });

    setFormData({ object: initObj, tools: initTools });
  }, [attributesConfig, initialAttributes, tools]);

  const validateAttribute = (attr: Attribute, value: any, isBlurOrSave: boolean = false) => {
    if (attr.type === "number") {
      if (typeof value === "string") {
        if (value === "" && !isBlurOrSave) return "";
        if (value === "") return "Value cannot be empty";
        const numValue = Number(value);
        if (isNaN(numValue)) return "Invalid number";
        if (attr.min !== undefined && numValue < attr.min) return `Must be at least ${attr.min}`;
        if (attr.max !== undefined && numValue > attr.max) return `Must be at most ${attr.max}`;
      }
    }
    if (attr.type === "position" && typeof value === "object" && "x" in value && "y" in value) {
      if ((value.x === "" || value.y === "") && !isBlurOrSave) return "";
      if (value.x === "" || value.y === "") return "Position values cannot be empty";
      const x = typeof value.x === "string" ? Number(value.x) : value.x;
      const y = typeof value.y === "string" ? Number(value.y) : value.y;
      if (isNaN(x) || isNaN(y)) return "Invalid position values";
      if (attr.min !== undefined && (x < attr.min || y < attr.min)) return `Position values must be at least ${attr.min}`;
      if (attr.max !== undefined && (x > attr.max || y > attr.max)) return `Position values must be at most ${attr.max}`;
    }
    return "";
  };

  const handleChange = (key: string, value: any, section: string = "object") => {
    setFormData((prev) => {
      console.log("handleChange", { key, value, section, prev });
      if (section === "object") {
        const newState = { ...prev, object: { ...prev.object, [key]: value } };
        console.log("Updated formData (object)", newState);
        return newState;
      } else {
        const toolIndex = parseInt(section.split("-")[1]);
        const newTools = [...prev.tools];
        newTools[toolIndex] = {
          ...newTools[toolIndex],
          attributes: { ...newTools[toolIndex].attributes, [key]: value },
        };
        const newState = { ...prev, tools: newTools };
        console.log("Updated formData (tools)", newState);
        return newState;
      }
    });

    const attr = section === "object"
      ? attributesConfig.find((a) => a.key === key)
      : tools[parseInt(section.split("-")[1])]?.attributesConfig.find((a) => a.key === key);

    if (attr) {
      const error = validateAttribute(attr, value);
      setErrors((prev) => ({ ...prev, [`${section}-${key}`]: error }));
    }
  };

  const handlePositionChange = (key: string, axis: "x" | "y", inputValue: string, section: string = "object") => {
    const currentPosition = section === "object"
      ? (formData.object[key] as { x: number | string; y: number | string } | undefined) || { x: "", y: "" }
      : (formData.tools[parseInt(section.split("-")[1])]?.attributes[key] as { x: number | string; y: number | string } | undefined) || { x: "", y: "" };
    const newPosition = { ...currentPosition, [axis]: inputValue };
    handleChange(key, newPosition, section);
  };

  const handleNumberBlur = (key: string, value: string, section: string = "object") => {
    const numValue = Number(value);
    const attr = section === "object"
      ? attributesConfig.find((a) => a.key === key)
      : tools[parseInt(section.split("-")[1])]?.attributesConfig.find((a) => a.key === key);
    const defaultValue = attr?.defaultValue ?? 0;
    const finalValue = value === "" || isNaN(numValue) ? defaultValue : numValue;
    handleChange(key, finalValue, section);
    const error = validateAttribute(attr!, finalValue, true);
    setErrors((prev) => ({ ...prev, [`${section}-${key}`]: error }));
  };

  const handlePositionBlur = (key: string, axis: "x" | "y", value: string, section: string = "object") => {
    const numValue = Number(value);
    const currentPosition = section === "object"
      ? (formData.object[key] as { x: number | string; y: number | string } | undefined) || { x: "", y: "" }
      : (formData.tools[parseInt(section.split("-")[1])]?.attributes[key] as { x: number | string; y: number | string } | undefined) || { x: "", y: "" };
    const attr = section === "object"
      ? attributesConfig.find((a) => a.key === key)
      : tools[parseInt(section.split("-")[1])]?.attributesConfig.find((a) => a.key === key);
    const defaultPos = (attr?.defaultValue as { x: number; y: number }) ?? { x: 0, y: 0 };
    const newPosition = {
      ...currentPosition,
      [axis]: value === "" || isNaN(numValue) ? defaultPos[axis] : numValue,
    };
    handleChange(key, newPosition, section);
    const error = validateAttribute(attr!, newPosition, true);
    setErrors((prev) => ({ ...prev, [`${section}-${key}`]: error }));
  };

  const hasErrors = Object.values(errors).some((error) => error !== "");

  const handleSave = () => {
    const parsedAttributes: { attributes: ParsedAttributes; tools: { id: string; attributes: ParsedAttributes }[] } = {
      attributes: {}, // Changed from 'object' to 'attributes' to match onSave type
      tools: [],
    };

    // Validate and parse object attributes
    attributesConfig.forEach((attr) => {
      const value = formData.object[attr.key];
      let parsedValue: number | string | boolean | { x: number; y: number } = value;
      if (attr.type === "number" && typeof value === "string") {
        const numValue = Number(value);
        parsedValue = value === "" || isNaN(numValue) ? attr.defaultValue : numValue;
      } else if (attr.type === "position" && typeof value === "object" && "x" in value && "y" in value) {
        const defaultPos = attr.defaultValue as { x: number; y: number };
        parsedValue = {
          x: typeof value.x === "string" ? (value.x === "" || isNaN(Number(value.x)) ? defaultPos.x : Number(value.x)) : value.x,
          y: typeof value.y === "string" ? (value.y === "" || isNaN(Number(value.y)) ? defaultPos.y : Number(value.y)) : value.y,
        };
      }
      parsedAttributes.attributes[attr.key] = parsedValue;
      const error = validateAttribute(attr, parsedValue, true);
      if (error) setErrors((prev) => ({ ...prev, [`object-${attr.key}`]: error }));
    });

    // Validate and parse tool attributes
    formData.tools.forEach((tool: { id: string; attributes: ParsedAttributes }, index: number) => {
      const toolConfig = tools[index]?.attributesConfig ?? [];
      const parsedToolAttrs: ParsedAttributes = {};
      toolConfig.forEach((attr) => {
        const value = tool.attributes[attr.key];
        let parsedValue: number | string | boolean | { x: number; y: number } = value;
        if (attr.type === "number" && typeof value === "string") {
          const numValue = Number(value);
          parsedValue = value === "" || isNaN(numValue) ? attr.defaultValue : numValue;
        } else if (attr.type === "position" && typeof value === "object" && "x" in value && "y" in value) {
          const defaultPos = attr.defaultValue as { x: number; y: number };
          parsedValue = {
            x: typeof value.x === "string" ? (value.x === "" || isNaN(Number(value.x)) ? defaultPos.x : Number(value.x)) : value.x,
            y: typeof value.y === "string" ? (value.y === "" || isNaN(Number(value.y)) ? defaultPos.y : Number(value.y)) : value.y,
          };
        }
        parsedToolAttrs[attr.key] = parsedValue;
        const error = validateAttribute(attr, parsedValue, true);
        if (error) setErrors((prev) => ({ ...prev, [`tool-${index}-${attr.key}`]: error }));
      });
      parsedAttributes.tools.push({ id: tool.id, attributes: parsedToolAttrs });
    });

    if (Object.values(errors).every((error) => error === "")) {
      console.log("Saving attributes", parsedAttributes);
      onSave(parsedAttributes);
    }
  };

  const renderFields = (
    fields: Attribute[],
    values: ParsedAttributes,
    onChange: (key: string, value: any, section: string) => void,
    section: string = "object"
  ) => (
    <div className="space-y-4">
      {fields.map((attr) => (
        <div key={attr.key} className="grid grid-cols-2 gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">{attr.name}</label>
          <div className="relative">
            {attr.type === "number" ? (
              <input
                type="number"
                value={(values[attr.key] as number | string) ?? ""}
                onChange={(e) => onChange(attr.key, e.target.value, section)}
                onBlur={(e) => handleNumberBlur(attr.key, e.target.value, section)}
                min={attr.min}
                max={attr.max}
                step={attr.step}
                className={`w-full border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`${section}-${attr.key}`] ? "border-red-500" : ""
                }`}
              />
            ) : attr.type === "color" ? (
              <input
                type="color"
                value={values[attr.key] as string}
                onChange={(e) => onChange(attr.key, e.target.value, section)}
                className="border border-gray-300 rounded p-1 h-8 w-full"
              />
            ) : attr.type === "boolean" ? (
              <input
                type="checkbox"
                checked={values[attr.key] as boolean}
                onChange={(e) => onChange(attr.key, e.target.checked, section)}
                className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              />
            ) : attr.type === "string" ? (
              <input
                type="text"
                value={values[attr.key] as string}
                onChange={(e) => onChange(attr.key, e.target.value, section)}
                className={`w-full border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`${section}-${attr.key}`] ? "border-red-500" : ""
                }`}
              />
            ) : attr.type === "select" && attr.options ? (
              <select
                value={values[attr.key] as string}
                onChange={(e) => onChange(attr.key, e.target.value, section)}
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
                  value={((values[attr.key] as { x: number | string; y: number | string } | undefined)?.x ?? "")}
                  onChange={(e) => handlePositionChange(attr.key, "x", e.target.value, section)}
                  onBlur={(e) => handlePositionBlur(attr.key, "x", e.target.value, section)}
                  min={attr.min}
                  max={attr.max}
                  step={attr.step}
                  className={`border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/2 ${
                    errors[`${section}-${attr.key}`] ? "border-red-500" : ""
                  }`}
                  placeholder="X"
                />
                <input
                  type="number"
                  value={((values[attr.key] as { x: number | string; y: number | string } | undefined)?.y ?? "")}
                  onChange={(e) => handlePositionChange(attr.key, "y", e.target.value, section)}
                  onBlur={(e) => handlePositionBlur(attr.key, "y", e.target.value, section)}
                  min={attr.min}
                  max={attr.max}
                  step={attr.step}
                  className={`border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/2 ${
                    errors[`${section}-${attr.key}`] ? "border-red-500" : ""
                  }`}
                  placeholder="Y"
                />
              </div>
            ) : null}
            {errors[`${section}-${attr.key}`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`${section}-${attr.key}`]}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl p-6 z-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{objectName} Attributes</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Object attributes */}
      {renderFields(attributesConfig, formData.object, handleChange, "object")}

      {/* Attached Tools */}
      {formData.tools.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Attached Tools</h3>
          {formData.tools.map((tool: { id: string; attributes: ParsedAttributes }, index: number) => (
            <div key={tool.id} className="border border-gray-200 rounded p-2 mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">{tools[index]?.name || "Tool"}</h4>
              {renderFields(tools[index]?.attributesConfig ?? [], tool.attributes, handleChange, `tool-${index}`)}
            </div>
          ))}
        </div>
      )}

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