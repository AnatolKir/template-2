'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimationCanvasProps {
  sectionId: string;
  code: string;
  onCodeUpdate: (sectionId: string, code: string) => void;
}

export function AnimationCanvas({ sectionId, code, onCodeUpdate }: AnimationCanvasProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    const executeAnimation = async () => {
      try {
        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Dynamically import anime.js
        const anime = (await import('animejs')).default;

        // Create a new function from the code string
        const animationFunction = new Function('anime', 'container', code);
        
        // Execute the animation function
        animationFunction(anime, containerRef.current);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Animation error:', err);
      }
    };

    executeAnimation();
  }, [code]);

  const handleSave = (newCode: string) => {
    onCodeUpdate(sectionId, newCode);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mt-4">
        <textarea
          className="w-full h-64 p-4 font-mono text-sm border rounded-lg"
          value={code}
          onChange={(e) => onCodeUpdate(sectionId, e.target.value)}
          placeholder="Paste your anime.js animation code here..."
        />
        <div className="mt-2 flex justify-end space-x-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(code)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div
        ref={containerRef}
        onClick={() => setIsEditing(true)}
        className={`w-full aspect-video bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors ${
          !code ? 'flex items-center justify-center' : ''
        }`}
      >
        {!code && (
          <p className="text-gray-500">Click to add animation code</p>
        )}
      </div>
    </div>
  );
} 