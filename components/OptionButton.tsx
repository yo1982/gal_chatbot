
import React from 'react';

interface OptionButtonProps {
  text: string;
  onClick: () => void;
}

export const OptionButton: React.FC<OptionButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-blue-500 text-blue-600 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
    >
      {text}
    </button>
  );
};
