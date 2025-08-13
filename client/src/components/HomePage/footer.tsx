import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-2 xl:mt-4 mx-auto w-full relative text-center bg-blue-600 text-white">
      <div className="px-6 py-3 md:py-4 xl:pt-8 xl:pb-4">
        <h2 className="font-bold text-xl xl:text-2xl leading-snug">
          Empower Your Lessons!<br />Start free trial today.
        </h2>
        <a
          className="mt-3 xl:mt-4 px-12 py-5 text-base font-medium leading-tight inline-block bg-blue-800 rounded-full shadow-xl border border-transparent hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-999 focus:ring-sky-500"
          href="#"
        >
          Get started
        </a>
        <div className="mt-4 xl:mt-6">
          <nav className="flex flex-wrap justify-center text-sm font-medium">
            <div className="px-5 py-2"><a href="#">Contact</a></div>
            <div className="px-5 py-2"><a href="#">Pricing</a></div>
            <div className="px-5 py-2"><a href="#">Privacy</a></div>
            <div className="px-5 py-2"><a href="#">Terms</a></div>
            <div className="px-5 py-2"><a href="#">Twitter</a></div>
          </nav>
          <p className="mt-3 text-sm">© 2023 XYZ, LLC</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;