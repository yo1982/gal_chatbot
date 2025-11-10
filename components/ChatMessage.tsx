
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const BotIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        GV
    </div>
);

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        U
    </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex items-start gap-3 my-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && <BotIcon />}
      <div className={`max-w-md md:max-w-lg p-3 rounded-lg shadow-md ${isBot ? 'bg-white text-gray-800 rounded-tl-none' : 'bg-blue-500 text-white rounded-tr-none'}`}>
        <div className="prose prose-sm">{message.content}</div>
        <div className={`text-xs mt-2 ${isBot ? 'text-gray-400' : 'text-blue-200'}`}>{message.timestamp}</div>
      </div>
      {!isBot && <UserIcon />}
    </div>
  );
};
