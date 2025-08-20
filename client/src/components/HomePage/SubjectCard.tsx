import React from "react";

interface SubjectCardProps {
  color: string; // Tailwind color e.g. "bg-sky-500"
  hoverColor: string; // Tailwind color e.g. "group-hover:bg-sky-400"
  icon: React.ReactNode;
  text: string;
  description: string;
  link: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ color, hoverColor, icon, text, description, link }) => {
  const handleClick = () => {
    window.location.href = link; // Navigate to the link URL
  };

  return (
    <div
      className="group relative h-25 sm:h-29 md:h-33 lg:h-35 w-full cursor-pointer overflow-hidden bg-white 
                 px-2 sm:px-3 md:px-4 pt-3 sm:pt-3 md:pt-4 pb-6 sm:pb-6 md:pb-8 shadow-xl ring-1 ring-gray-900/5 
                 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl rounded-lg"
      onClick={handleClick}
      style={{ WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", userSelect: "none" }}
    >
      <span
        className={`absolute top-3 z-0 h-10 sm:h-12 md:h-14 w-10 sm:w-12 md:w-14 rounded-full ${color} 
                   transition-all duration-300 group-hover:scale-[6] sm:group-hover:scale-[7] md:group-hover:scale-[15]`}
      ></span>
      <div className="relative z-10 flex flex-col h-full">
        <span
          className={`grid h-10 sm:h-12 md:h-14 w-10 sm:w-12 md:w-14 place-items-center rounded-full ${color} 
                     transition-all duration-300 ${hoverColor} flex-shrink-0`}
        >
          <div className="scale-75 sm:scale-75 md:scale-90">
            {icon}
          </div>
        </span>
        <div
          className="flex-1 pt-1 sm:pt-2 text-sm sm:text-sm md:text-base leading-4 sm:leading-5 md:leading-6 text-gray-600 
                     transition-all duration-300 group-hover:text-white user-select-none "
          style={{ WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", userSelect: "none" }}
        >
          <p className="font-bold text-sm sm:text-sm md:text-base user-select-none">{text}</p>
          <p className="text-sm sm:text-xs md:text-sm leading-5 sm:leading-4 md:leading-5 user-select-none 
                     hidden sm:block ">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;