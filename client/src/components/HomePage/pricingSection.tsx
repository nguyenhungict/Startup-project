import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface PlanProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  link: string;
}

const Plan: React.FC<PlanProps> = ({ title, price, description, features, link }) => {
  return (
    <li className="p-6 shadow-xl rounded-xl ring-1 ring-black/5 shadow-black/10">
      <h3 className="font-bold tracking-tight text-blue-600">{title}</h3>
      <p className="mt-6 text-4xl font-bold tracking-tighter">{price}</p>
      <p className="mt-3 text-black/60">{description}</p>
      <ul className="mt-6 space-y-1.5">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-1.5 font-medium">
            <CheckIcon className="flex-shrink-0 w-5 h-5 text-blue-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        className="flex mt-3 justify-center bg-gray-100 rounded-xl py-1 hover:bg-blue-600 hover:text-white"
        href={link}
      >
        Try 7 days for free
      </a>
    </li>
  );
};

const Pricing: React.FC = () => {
  const plans = [
    {
      title: 'Starter',
      price: '$5',
      description: 'For small businesses that want to automate their link previews and start growing.',
      features: ['10 Sites', '50 Templates', '250 Images per month', 'Full API access'],
      link: 'https://previewify.app/app/register',
    },
    {
      title: 'Pro',
      price: '$14',
      description: 'For professional businesses that require automation for scaling their link previews.',
      features: ['50 Sites', '100 Templates', '1000 Images per month', 'Full API access'],
      link: 'https://previewify.app/app/register',
    },
    {
      title: 'Business',
      price: '$29',
      description: 'For large organizations that require high volume automation for their link previews.',
      features: ['10000 Sites', '10000 Templates', '10000 Images per month', 'Full API access'],
      link: 'https://previewify.app/app/register',
    },
  ];

  return (
    <ul className="grid gap-6 mt-6 md:gap-12 md:grid-cols-3 p-5">
      {plans.map((plan, index) => (
        <Plan key={index} {...plan} />
      ))}
    </ul>
  );
};

export default Pricing;