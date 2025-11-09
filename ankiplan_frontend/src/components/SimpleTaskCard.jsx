import React from 'react';

const SimpleTaskCard = ({ title, points, priority, completed, description, onMarkDone, onEdit, onDelete }) => {
  return (
    <div
      className={`
        flex justify-between items-center p-4 rounded-2xl shadow-soft border transition-colors
        ${completed
          ? 'border-green-400 bg-green-50'
          : 'border-gray-200 bg-white hover:bg-gray-50'
        }
      `}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-800 truncate">{title}</h3>
          {priority && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              P{priority}
            </span>
          )}
        </div>
        {description && !completed && (
          <p className="text-sm text-gray-500 truncate mb-1">{description}</p>
        )}
        <p className="text-sm text-gray-500">{points || 0} XP</p>
      </div>
      <div className="flex items-center gap-2 ml-3">
        {!completed && onMarkDone && (
          <button
            onClick={onMarkDone}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium text-sm"
          >
            Mark Done
          </button>
        )}
        {completed && (
          <span className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm">
            ✅ Done
          </span>
        )}
        {!completed && onEdit && (
          <button
            onClick={onEdit}
            className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            title="Edit task"
          >
            📝
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete task"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

export default SimpleTaskCard;

