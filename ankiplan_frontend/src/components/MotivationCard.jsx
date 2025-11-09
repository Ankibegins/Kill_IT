import React from 'react';

const MotivationCard = ({ message }) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">💪</span>
        <h2 className="text-2xl font-bold">Daily Motivation</h2>
      </div>
      <p className="text-lg leading-relaxed">{message || 'Loading motivation...'}</p>
    </div>
  );
};

export default MotivationCard;



