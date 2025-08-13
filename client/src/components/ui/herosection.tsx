import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="text-center pb-20 px-4 md:px-16 bg-white ">
      <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-gray-800">
        Empower Teaching with Interactive Science Simulations
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Bring math, physics, chemistry, and biology to life with virtual experiments for your classroom.
      </p>
      <div className="flex justify-center space-x-4">
        <a
          href="#"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Start Simulating Now
        </a>
        <a
          href="#"
          className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
        >
          Explore Free Tools
        </a>
      </div>
    </section>
  );
};

export default HeroSection;

