import React, { useState, useEffect } from 'react';
import { getMotivation, getTaskSuggestion } from '../services/api';
import MotivationCard from '../components/MotivationCard';

const AiCoach = () => {
  const [motivation, setMotivation] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [loadingMotivation, setLoadingMotivation] = useState(true);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMotivation();
  }, []);

  const fetchMotivation = async () => {
    try {
      setLoadingMotivation(true);
      const response = await getMotivation();
      setMotivation(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load motivation');
    } finally {
      setLoadingMotivation(false);
    }
  };

  const fetchSuggestion = async () => {
    try {
      setLoadingSuggestion(true);
      const response = await getTaskSuggestion();
      setSuggestion(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get suggestion');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Coach</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        {loadingMotivation ? (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">💪</span>
              <h2 className="text-2xl font-bold">Daily Motivation</h2>
            </div>
            <p className="text-lg">Loading...</p>
          </div>
        ) : (
          <MotivationCard message={motivation} />
        )}
        <button
          onClick={fetchMotivation}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Refresh Motivation
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Task Suggestion</h2>
        <button
          onClick={fetchSuggestion}
          disabled={loadingSuggestion}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 mb-4"
        >
          {loadingSuggestion ? 'Getting suggestion...' : 'Suggest a Task'}
        </button>

        {suggestion && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <p className="text-lg text-gray-800 mb-2">{suggestion.suggestion}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Category: <strong>{suggestion.category}</strong></span>
              <span>Priority: <strong>{suggestion.priority}</strong></span>
              {suggestion.value && (
                <span>Points: <strong>{suggestion.value}</strong></span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiCoach;



