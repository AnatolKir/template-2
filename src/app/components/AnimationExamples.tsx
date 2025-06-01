'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface AnimationExamplesProps {
  type: string;
  data?: any;
}

export function AnimationExamples({ type, data }: AnimationExamplesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing animations
    containerRef.current.innerHTML = '';

    switch (type) {
      case 'basic':
        // Create a simple shape
        const circle = document.createElement('div');
        circle.style.width = '50px';
        circle.style.height = '50px';
        circle.style.backgroundColor = '#4CAF50';
        circle.style.borderRadius = '50%';
        containerRef.current.appendChild(circle);

        // Animate it
        anime({
          targets: circle,
          translateX: 250,
          rotate: '1turn',
          duration: 2000,
          loop: true,
          direction: 'alternate',
          easing: 'easeInOutQuad'
        });
        break;

      case 'timeline':
        // Create multiple elements
        const elements = Array.from({ length: 5 }, (_, i) => {
          const el = document.createElement('div');
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.backgroundColor = `hsl(${i * 50}, 70%, 50%)`;
          el.style.margin = '5px';
          containerRef.current?.appendChild(el);
          return el;
        });

        // Create a timeline animation
        const timeline = anime.timeline({
          duration: 1000,
          loop: true
        });

        elements.forEach((el, i) => {
          timeline.add({
            targets: el,
            translateY: 50,
            rotate: 180,
            delay: i * 100,
            direction: 'alternate',
            easing: 'easeInOutSine'
          });
        });
        break;

      case 'custom':
        if (data && containerRef.current) {
          // Handle custom animation based on data
          // This would be implemented based on specific needs
          console.log('Custom animation with data:', data);
        }
        break;

      default:
        console.warn('Unknown animation type:', type);
    }
  }, [type, data]);

  return (
    <div 
      ref={containerRef}
      className="flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg p-4"
    />
  );
}
