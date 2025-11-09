import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 md:p-6 lg:p-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
};

export const SkeletonTask = () => {
  return (
    <div className="flex justify-between items-center p-4 rounded-2xl border border-gray-200 bg-white animate-pulse">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
    </div>
  );
};

