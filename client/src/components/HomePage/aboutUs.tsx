import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="sm:flex items-center max-w-screen-xl">
      <div className="sm:w-1/2 p-0">
        <div className="image object-center text-center">
          <img src="https://i.imgur.com/WbQnbas.png" alt="About Us Image" className="mb-0" />
        </div>
      </div>
      <div className="sm:w-1/2 p-5">
        <div className="text">
          <span className="text-gray-500 border-b-2 border-blue-600 uppercase">About us</span>
          <h2 className="my-4 font-bold text-3xl sm:text-4xl ">
            About <span className="text-blue-600">Our Company</span>
          </h2>
          <p className="text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid, commodi
            doloremque, fugiat illum magni minus nisi nulla numquam obcaecati placeat quia, repellat tempore
            voluptatum.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;