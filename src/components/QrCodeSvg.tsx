import React from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Deterministic visual QR pattern generator rendered as clean vector SVG
 */
export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({ value, size = 160, className = '' }) => {
  // Generate a pseudo-random yet deterministic 25x25 grid from hash of value
  const gridSize = 25;
  const matrix: boolean[][] = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));

  // Helper for hash
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }

  // Draw 3 standard corner finder patterns
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(gridSize - 7, 0); // Top-right
  drawFinder(0, gridSize - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    if (i % 2 === 0) {
      matrix[6][i] = true;
      matrix[i][6] = true;
    }
  }

  // Fill internal data with hash seed
  let seed = Math.abs(hash);
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finder zones
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= gridSize - 8) ||
        (r >= gridSize - 8 && c < 8) ||
        (r === 6 || c === 6)
      ) {
        continue;
      }
      seed = (seed * 9301 + 49297) % 233280;
      matrix[r][c] = (seed / 233280) > 0.48;
    }
  }

  const cellSize = size / gridSize;

  return (
    <div className={`p-3 bg-white rounded-xl shadow-inner inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shape-rendering-crispEdges block"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {matrix.map((row, rIdx) =>
          row.map((isDark, cIdx) =>
            isDark ? (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx * cellSize}
                y={rIdx * cellSize}
                width={cellSize + 0.1}
                height={cellSize + 0.1}
                fill="#090d16"
                rx={0.5}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
