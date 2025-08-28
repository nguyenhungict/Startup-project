import { useState } from "react";

export const useTopicSelection = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  return {
    selectedTopic,
    handleTopicSelect,
  };
};