import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
    onCancel: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000000';
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const { offsetX, offsetY } = getCoordinates(e, canvas);
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY);
            }
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const { offsetX, offsetY } = getCoordinates(e, canvas);
                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
                setHasSignature(true);
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        const rect = canvas.getBoundingClientRect();
        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setHasSignature(false);
            }
        }
    };

    const save = () => {
        const canvas = canvasRef.current;
        if (canvas && hasSignature) {
            onSave(canvas.toDataURL());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-4">Sign Document</h3>

                <div className="border border-slate-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white touch-none">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className="w-full h-48 cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">Draw your signature above</p>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={clear}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                        Clear
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={save}
                            disabled={!hasSignature}
                            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sign & Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignaturePad;
