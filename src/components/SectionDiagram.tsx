'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface SectionDiagramProps {
  content: string;
}

export function SectionDiagram({ content }: SectionDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [diagramText, setDiagramText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    });
  }, []);

  useEffect(() => {
    if (diagramText && diagramRef.current) {
      const renderDiagram = async () => {
        try {
          // Clear previous content
          diagramRef.current!.innerHTML = '';
          
          // Clean up the diagram text
          let cleanDiagramText = diagramText
            .replace(/^(Here is |This is |The )?([a-zA-Z\s]+)?diagram:?\s*/i, '')
            .trim();
            
          const id = 'diagram-' + Math.random().toString(36).substr(2, 9);
          
          // Parse and validate the diagram
          await mermaid.parse(cleanDiagramText);
          
          // If parsing succeeds, render the diagram
          const { svg } = await mermaid.render(id, cleanDiagramText);
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
          }
          setError(null);
        } catch (error) {
          console.error('Error rendering diagram:', error);
          setError('Error rendering diagram: ' + (error instanceof Error ? error.message : String(error)));
          
          // Show the diagram text when there's a rendering error
          if (diagramRef.current) {
            diagramRef.current.innerHTML = `<pre class="text-red-500 whitespace-pre-wrap overflow-x-auto">${diagramText}</pre>`;
          }
        }
      };
      renderDiagram();
    }
  }, [diagramText]);

  const handleGenerateDiagram = async () => {
    if (!diagramRef.current) return;

    try {
      // Clear previous content and error
      diagramRef.current.innerHTML = 'Generating diagram...';
      setDiagramText('');
      setError(null);
      setIsLoading(true);

      // Call Claude API to generate Mermaid diagram
      const response = await fetch('/api/claude/generate-diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: content }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || data.details || 'Failed to generate diagram');
      }

      setDiagramText(data.value);

    } catch (error) {
      console.error('Error:', error);
      setError('Error generating diagram: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleGenerateDiagram}
        disabled={isLoading}
        className={`px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Generating...' : 'Generate Diagram'}
      </button>
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
      <div
        ref={diagramRef}
        className="mt-4 p-4 bg-gray-50 rounded-lg min-h-[100px] overflow-auto"
      />
    </div>
  );
} 