import { useState, useMemo } from "react";
import { physicsData } from "../../data/physicsData";

export const useSubtopicSelection = (selectedTopic: string | null) => {
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);

  const handleSubtopicSelect = (subtopic: string | null) => {
    if (selectedTopic) {
      setSelectedSubtopic(subtopic);
    }
  };

  const availableSubtopics = selectedTopic
    ? Object.keys(physicsData[selectedTopic] || {})
    : [];

  const selectedSubtopicData = useMemo(() => {
    if (selectedTopic && selectedSubtopic) {
      return physicsData[selectedTopic]?.[selectedSubtopic] ?? null;
    }
    return null;
  }, [selectedTopic, selectedSubtopic]);

  const objects = selectedSubtopicData?.objects ?? [];
  const globalTools = selectedSubtopicData?.globalTools ?? [];
  const objectTools = selectedSubtopicData?.objectTools ?? [];

  return {
    selectedSubtopic,
    handleSubtopicSelect,
    availableSubtopics,
    objects,
    globalTools,
    objectTools,
  };
};
