import React, { useEffect, useState, useRef } from 'react';

interface PaginatedContentProps {
    content: string;
}

const A4_HEIGHT_PX = 1123; // A4 height in pixels at 96 DPI
const PAGE_PADDING_PX = 80; // Total vertical padding (40px top + 40px bottom)
const CONTENT_HEIGHT_PX = A4_HEIGHT_PX - PAGE_PADDING_PX;

const PaginatedContent: React.FC<PaginatedContentProps> = ({ content }) => {
    const [pages, setPages] = useState<string[]>([]);
    const measureRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!measureRef.current) return;

        // 1. Render content into hidden container to parse and measure
        // We need to inject into the inner prose div to match structure
        const innerWrapper = measureRef.current.querySelector('.prose');
        if (!innerWrapper) return;

        innerWrapper.innerHTML = content;
        const children = Array.from(innerWrapper.children) as HTMLElement[];

        const newPages: string[] = [];
        let currentPageContent: HTMLElement[] = [];
        let currentHeight = 0;

        // Safety margin to prevent slight overflows
        const SAFE_CONTENT_HEIGHT = CONTENT_HEIGHT_PX - 20;

        children.forEach((child) => {
            // Clone to measure properly without affecting original flow if needed, 
            // but here we just read computed styles.
            // Note: Margins collapse, so simple addition might overestimate, which is safer (splits earlier).
            const style = window.getComputedStyle(child);
            const marginTop = parseInt(style.marginTop) || 0;
            const marginBottom = parseInt(style.marginBottom) || 0;
            const childHeight = child.offsetHeight + marginTop + marginBottom;

            const isPageBreak = child.tagName === 'HR';

            if (isPageBreak) {
                // Force new page
                if (currentPageContent.length > 0) {
                    newPages.push(currentPageContent.map(el => el.outerHTML).join(''));
                    currentPageContent = [];
                    currentHeight = 0;
                }
                // We don't add the HR itself to the output, it's just a marker.
                // Unless we want a visual line? Let's skip it for a clean break.
                return;
            }

            if (currentHeight + childHeight > SAFE_CONTENT_HEIGHT) {
                // Push current page if it has content
                if (currentPageContent.length > 0) {
                    newPages.push(currentPageContent.map(el => el.outerHTML).join(''));
                    currentPageContent = [];
                    currentHeight = 0;
                }

                // If the child itself is bigger than the page, we have to put it on a new page
                // and it will likely overflow/clip.
                currentPageContent.push(child);
                currentHeight += childHeight;
            } else {
                currentPageContent.push(child);
                currentHeight += childHeight;
            }
        });

        // Push last page
        if (currentPageContent.length > 0) {
            newPages.push(currentPageContent.map(el => el.outerHTML).join(''));
        }

        // If no content, show at least one empty page
        if (newPages.length === 0) {
            setPages(['']);
        } else {
            setPages(newPages);
        }

    }, [content]);

    return (
        <div className="flex flex-col gap-8 items-center">
            {/* Hidden measurement container - MUST match page styles exactly */}
            <div
                ref={measureRef}
                className="absolute opacity-0 pointer-events-none bg-white text-slate-800 p-[40px] font-sans"
                style={{
                    visibility: 'hidden',
                    left: '-9999px',
                    top: 0,
                    width: '794px',
                }}
            >
                <div className="prose prose-slate max-w-none">
                    {/* Content injected here */}
                </div>
            </div>

            {/* Rendered Pages */}
            {pages.map((pageContent, index) => (
                <div
                    key={index}
                    className="bg-white text-slate-800 p-[40px] font-sans relative shadow-xl flex flex-col overflow-hidden shrink-0"
                    style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px' }}
                >
                    <div
                        className="prose prose-slate max-w-none h-full"
                        dangerouslySetInnerHTML={{ __html: pageContent }}
                    />

                    {/* Page Number */}
                    <div className="absolute bottom-4 right-8 text-xs text-slate-400">
                        Page {index + 1} of {pages.length}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PaginatedContent;
