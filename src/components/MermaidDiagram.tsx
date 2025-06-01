'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  sectionId: string;
  content: string;
}

export function MermaidDiagram({ sectionId, content }: MermaidDiagramProps) {
  const [diagram, setDiagram] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  const generateDiagram = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/claude/generate-diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diagram');
      }

      const data = await response.json();
      setDiagram(data.diagram);

      // Render the Mermaid diagram
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        const { svg } = await mermaid.render(`mermaid-${sectionId}`, data.diagram);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error generating diagram:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={generateDiagram}
        disabled={loading}
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Diagram'}
      </button>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div
        ref={containerRef}
        className="mt-4 p-4 bg-white rounded-lg border"
      />
    </div>
  );
} 