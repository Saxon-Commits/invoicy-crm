import React, { useRef, useState, useEffect } from 'react';

interface ScaledPreviewWrapperProps {
    children: React.ReactNode;
}

const ScaledPreviewWrapper: React.FC<ScaledPreviewWrapperProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const A4_WIDTH = 794; // Fixed width from DocumentPreview

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const parentWidth = containerRef.current.offsetWidth;
                // Add some padding/margin consideration if needed, but usually parent width is enough
                // We want to scale down if parent is smaller than A4, 
                // and maybe scale up slightly or just stay at 1 if larger? 
                // Let's stick to scaling down for now to fit, and maybe max scale of 1.2 for large screens if desired.
                // For "fit to screen" behavior:
                const newScale = Math.min(parentWidth / A4_WIDTH, 1.5); // Allow some zoom in on large screens
                setScale(newScale);
            }
        };

        // Initial calculation
        updateScale();

        // Resize observer for responsiveness
        const resizeObserver = new ResizeObserver(() => {
            updateScale();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', updateScale);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateScale);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto overflow-x-hidden flex justify-center items-start bg-slate-200 dark:bg-zinc-950 p-8"
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    width: `${A4_WIDTH}px`,
                    minWidth: `${A4_WIDTH}px`, // Ensure it doesn't shrink below A4 width
                }}
                className="transition-transform duration-200 ease-out flex flex-col gap-8 flex-shrink-0 origin-top"
            >
                {children}
            </div>
        </div>
    );
};

export default ScaledPreviewWrapper;
