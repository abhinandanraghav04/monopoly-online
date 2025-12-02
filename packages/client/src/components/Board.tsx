import { useEffect, useRef } from 'react';

const BOARD_SIZE = 600;

const Board = (): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const gradient = context.createLinearGradient(0, 0, BOARD_SIZE, BOARD_SIZE);
    gradient.addColorStop(0, '#312e81');
    gradient.addColorStop(1, '#4f46e5');

    context.fillStyle = gradient;
    context.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    context.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    context.lineWidth = 4;
    context.strokeRect(0, 0, BOARD_SIZE, BOARD_SIZE);
  }, []);

  return (
    <div className="rounded-3xl border border-slate-600 bg-background-secondary/60 p-4 shadow-xl backdrop-blur">
      <canvas
        ref={canvasRef}
        width={BOARD_SIZE}
        height={BOARD_SIZE}
        className="h-full w-full max-w-full rounded-2xl bg-background-primary"
      />
    </div>
  );
};

export default Board;
