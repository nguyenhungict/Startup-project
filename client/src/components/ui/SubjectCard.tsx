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
      className="group relative h-32 md:h-36 lg:h-40 cursor-pointer overflow-hidden bg-white px-4 pt-4 pb-4 shadow-xl 
                 ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl 
                 sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-6"
      onClick={handleClick}
      style={{ WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", userSelect: "none" }}
    >
      <span
        className={`absolute top-4 z-0 h-16 w-16 rounded-full ${color} transition-all duration-300 group-hover:scale-[10]`}
      ></span>
      <div className="relative z-10 mx-auto max-w-md">
        <span
          className={`grid h-16 w-16 place-items-center rounded-full ${color} transition-all duration-300 ${hoverColor}`}
        >
          {icon}
        </span>
        <div
          className="space-y-1 pt-2 text-base leading-6 text-gray-600 transition-all duration-300 
                     group-hover:text-white user-select-none"
          style={{ WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", userSelect: "none" }}
        >
          <p className="font-bold user-select-none">{text}</p>
          <p className="text-sm user-select-none">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;