import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: 'How does the simulation tool work?',
      answer: 'Our simulation tool uses advanced algorithms to replicate real-world scientific experiments in a virtual environment, allowing teachers to demonstrate concepts interactively.',
    },
    {
      question: 'Is there a cost to use the free trial?',
      answer: 'No, the free trial is completely free for 7 days with full access to all features. No credit card is required to start.',
    },
    {
      question: 'Can I use this for multiple classes?',
      answer: 'Yes, our plans support multiple users and sites, making it ideal for managing experiments across various classes. Check our pricing for details.',
    },
    {
      question: 'What kind of experiments can I simulate?',
      answer: 'You can simulate a wide range of experiments including chemistry reactions, physics laws, and biological processes, all customizable to your curriculum.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="border-b border-gray-200">
            <button
              className="w-full text-left py-4 font-medium text-gray-700 focus:outline-none"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="flex justify-between items-center">
                {item.question}
                <svg
                  className={`w-5 h-5 transform transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <p className="py-4 text-gray-600">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;