import React from 'react';

const TaskCard = ({ task, onComplete, onDelete }) => {
  const categoryColors = {
    daily: 'bg-green-100 text-green-800',
    weekly: 'bg-blue-100 text-blue-800',
    weekend: 'bg-purple-100 text-purple-800',
    monthly: 'bg-orange-100 text-orange-800',
  };

  const priorityLabels = {
    1: 'Critical',
    2: 'High',
    3: 'Medium',
    4: 'Low',
    5: 'Very Low',
  };

  const priorityColors = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-blue-500',
    5: 'bg-gray-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[task.category] || 'bg-gray-100 text-gray-800'}`}>
              {task.category}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${priorityColors[task.priority] || 'bg-gray-500'}`}>
              {priorityLabels[task.priority] || `Priority ${task.priority}`}
            </span>
          </div>
          {task.description && (
            <p className="text-gray-600 mb-3">{task.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Points: {task.value}</span>
            <span className={task.is_completed ? 'text-green-600 font-medium' : 'text-gray-500'}>
              {task.is_completed ? '✓ Completed' : '○ Incomplete'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 ml-4">
          {!task.is_completed && (
            <button
              onClick={() => onComplete(task.id)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
            >
              Complete
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;



