import { useState } from "react";
import { physicsData } from "../../data/physicsData";

export const useSubtopicSelection = (selectedTopic: string | null) => {
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);

  const handleSubtopicSelect = (subtopic: string | null) => {
    if (selectedTopic) {
      setSelectedSubtopic(subtopic);
    }
  };

  const availableSubtopics = selectedTopic ? Object.keys(physicsData[selectedTopic] || {}) : [];

  return {
    selectedSubtopic,
    handleSubtopicSelect,
    availableSubtopics,
  };
};