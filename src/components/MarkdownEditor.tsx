'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ComponentProps } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { SectionDiagram } from './SectionDiagram';

interface Section {
  id: string;
  heading: string;
  content: string;
}

interface MarkdownComponentProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const { user, signInWithGoogle, loading } = useAuth();
  const [authError, setAuthError] = useState<string>('');

  useEffect(() => {
    // Parse markdown to find headings and create sections
    const lines = markdown.split('\n');
    const newSections: Section[] = [];
    let currentSection: Section = {
      id: '',
      heading: '',
      content: ''
    };
    let currentContent: string[] = [];

    lines.forEach((line: string, index: number) => {
      if (line.startsWith('#')) {
        // If we have a previous section, save it
        if (currentSection.id) {
          currentSection.content = currentContent.join('\n');
          newSections.push({...currentSection});
          currentContent = [];
        }
        // Create new section
        currentSection = {
          id: Math.random().toString(36).substr(2, 9),
          heading: line.replace(/^#+\s/, ''),
          content: ''
        };
      } else if (currentSection.id) {
        // Check if next line is a heading
        const isLastLine = index === lines.length - 1;
        const nextLine = !isLastLine ? lines[index + 1] : '';
        const isNextLineHeading = nextLine.startsWith('#');
        
        // Only add line if it's not empty or if it's not followed by a heading
        if (line.trim() || !isNextLineHeading) {
          currentContent.push(line);
        }
      }
    });

    // Add the last section if exists
    if (currentSection.id) {
      currentSection.content = currentContent.join('\n');
      newSections.push({...currentSection});
    }

    setSections(newSections);
  }, [markdown]);

  const handleSignIn = async () => {
    try {
      setAuthError('');
      await signInWithGoogle();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to sign in');
    }
  };

  // Create a map of headings to section IDs for quick lookup
  const headingToSection = new Map(
    sections.map(section => [section.heading, section])
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to Markdown Animator</h2>
            <p className="mt-2 text-sm text-gray-600">Please sign in to continue</p>
          </div>
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{authError}</span>
            </div>
          )}
          <div>
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-screen">
      {/* Editor Panel */}
      <div className="w-1/2 border rounded-lg bg-white overflow-hidden flex flex-col shadow-sm">
        <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
          <div className="text-sm font-medium text-gray-700">Editor</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{user.email}</span>
          </div>
        </div>
        <textarea
          className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-0 border-0"
          placeholder="Paste your markdown content here..."
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 border rounded-lg bg-white overflow-hidden flex flex-col shadow-sm">
        <div className="p-3 border-b bg-gray-50">
          <div className="text-sm font-medium text-gray-700">Preview</div>
        </div>
        <div className="flex-1 overflow-auto">
          <article className="prose prose-slate max-w-none p-8">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({children, ...props}: MarkdownComponentProps) => {
                  const headingText = children?.toString() || '';
                  const section = headingToSection.get(headingText);
                  return (
                    <>
                      <h1 className="text-3xl font-bold mb-6 pb-2 border-b" {...props}>{children}</h1>
                      {section && <SectionDiagram content={section.content} />}
                    </>
                  );
                },
                h2: ({children, ...props}: MarkdownComponentProps) => {
                  const headingText = children?.toString() || '';
                  const section = headingToSection.get(headingText);
                  return (
                    <>
                      <h2 className="text-2xl font-bold mt-8 mb-4" {...props}>{children}</h2>
                      {section && <SectionDiagram content={section.content} />}
                    </>
                  );
                },
                p: ({children, ...props}: MarkdownComponentProps) => (
                  <div className="my-4 leading-7" {...props}>{children}</div>
                ),
                ul: ({children, ...props}: MarkdownComponentProps) => (
                  <ul className="my-4 space-y-2" {...props}>{children}</ul>
                ),
                li: ({children, ...props}: MarkdownComponentProps) => (
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span {...props}>{children}</span>
                  </li>
                ),
                img: ({...props}: ComponentProps<'img'>) => (
                  <div className="my-8">
                    <img className="max-w-full rounded-lg border shadow-sm" {...props} />
                  </div>
                ),
                blockquote: ({children, ...props}: MarkdownComponentProps) => (
                  <blockquote className="bg-gray-50 border-l-4 border-gray-200 p-4 my-6 rounded-r" {...props}>{children}</blockquote>
                ),
                code: ({children, className, inline, ...props}: MarkdownComponentProps & { inline?: boolean }) => {
                  if (inline) {
                    return <code className="bg-gray-100 rounded px-1 py-0.5 text-sm" {...props}>{children}</code>;
                  }
                  return (
                    <div className="my-4">
                      <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto" {...props}>{children}</pre>
                    </div>
                  );
                }
              }}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
} 