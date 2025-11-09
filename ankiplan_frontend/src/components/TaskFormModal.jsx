import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const TaskFormModal = ({ isOpen, onClose, onSave, category = 'daily', task = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);
  const [specificDate, setSpecificDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Calculate points based on priority and category
  useEffect(() => {
    let points = priority * 5; // Base: priority × 5
    if (selectedCategory === 'weekly') {
      points *= 2;
    } else if (selectedCategory === 'monthly') {
      points *= 3;
    }
    setCalculatedPoints(points);
  }, [priority, selectedCategory]);

  // Initialize form when task is provided (edit mode)
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      // Extract description and date for editing
      let desc = task.description || '';
      let date = '';
      if (desc && desc.includes('Due:')) {
        // Match "Due: YYYY-MM-DD" pattern, possibly inside parentheses
        const dateMatch = desc.match(/Due:\s*(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          date = dateMatch[1];
          // Remove the date part from description
          desc = desc.replace(/\s*\(?\s*Due:\s*\d{4}-\d{2}-\d{2}\s*\)?/g, '').trim();
          // Clean up extra parentheses
          desc = desc.replace(/^\(+|\)+$/g, '').trim();
        }
      }
      setDescription(desc);
      setPriority(task.priority || 0);
      // Determine if it's a specific-day task
      if (task.description && task.description.includes('Due:')) {
        setSelectedCategory('specific');
        setSpecificDate(date);
      } else {
        setSelectedCategory(task.category || category);
      }
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setPriority(0);
      setSelectedCategory(category);
      setSpecificDate('');
    }
  }, [task, category, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validation
    if (!title.trim() || title.trim().length < 2) {
      setFormError('Task title must be at least 2 characters.');
      return;
    }
    
    const pr = Number(priority);
    if (Number.isNaN(pr) || pr < 0 || pr > 10) {
      setFormError('Priority must be a number between 0 and 10.');
      return;
    }
    
    if (selectedCategory === 'specific' && !specificDate) {
      setFormError('Please select a due date for specific-day tasks.');
      return;
    }

    setIsSaving(true);

    try {
      // For specific-day tasks, use 'daily' category (backend doesn't support specific-day)
      const taskCategory = selectedCategory === 'specific' ? 'daily' : selectedCategory;

      // Build description with date if it's a specific-day task
      let finalDescription = description.trim() || null;
      if (selectedCategory === 'specific' && specificDate) {
        finalDescription = description.trim() 
          ? `${description.trim()} (Due: ${specificDate})` 
          : `Due: ${specificDate}`;
      }

      const taskData = {
        title: title.trim(),
        description: finalDescription,
        category: taskCategory,
        priority: pr,
        value: calculatedPoints,
      };

      await onSave(taskData, task?.id);
      // If onSave succeeds, it will close the modal, so we don't need to do it here
    } catch (err) {
      console.error('Form submit error:', err);
      // Extract error message safely
      let errorMsg = 'Failed to save task';
      if (err?.message) {
        errorMsg = err.message;
      } else if (err?.response?.data) {
        const d = err.response.data;
        if (typeof d === 'string') {
          errorMsg = d;
        } else if (d.detail) {
          if (typeof d.detail === 'string') {
            errorMsg = d.detail;
          } else if (Array.isArray(d.detail)) {
            errorMsg = d.detail.map(e => e.msg || JSON.stringify(e)).join('; ');
          }
        } else if (d.message) {
          errorMsg = d.message;
        }
      }
      setFormError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const categoryLabel = task ? 'Edit Task' : `Add ${selectedCategory === 'specific' ? 'Specific Day' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Task`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={categoryLabel}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded-xl w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="border border-gray-300 rounded-xl w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-xl w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!!task} // Don't allow category change when editing
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="specific">Specific Day</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={priority}
              onChange={(e) => setPriority(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
              className="border border-gray-300 rounded-xl w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {selectedCategory === 'specific' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="border border-gray-300 rounded-xl w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={selectedCategory === 'specific'}
            />
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Points Value:</span>
            <span className="text-lg font-bold text-blue-600">{calculatedPoints} XP</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Calculated: Priority ({priority}) × 5
            {selectedCategory === 'weekly' && ' × 2 (Weekly)'}
            {selectedCategory === 'monthly' && ' × 3 (Monthly)'}
          </p>
        </div>

        {/* Form Error Display */}
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-4">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="text-sm">
                {typeof formError === 'string' ? formError : JSON.stringify(formError)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              task ? 'Update Task' : 'Save Task'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;

