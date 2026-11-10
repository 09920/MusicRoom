import React, { useState, useEffect, useRef } from 'react';

export default function BlurText({ text = '', className = '' }) {
  const words = text ? text.split(' ') : [];
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <p
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: '0.1em'
      }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-700 ease-out"
          style={{
            filter: inView ? 'blur(0px)' : 'blur(10px)',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: `${i * 60}ms`
          }}
        >
          {word}&nbsp;
        </span>
      ))}
    </p>
  );
}
