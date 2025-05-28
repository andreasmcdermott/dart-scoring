import { For } from 'solid-js';

const DART_BOARD_NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

const DartBoard = ({onScore}: {onScore: (score: number, multiplier: number) => void}) => {
  const centerX = 195;
  const centerY = 195;
  const outerRadius = 190;
  const doubleOuterRadius = 155;
  const doubleInnerRadius = 125;
  const trebleOuterRadius = 115;
  const trebleInnerRadius = 85;
  const bullseyeRadius = 15;
  const outerBullRadius = 32;

  const createSegmentPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;

    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);

    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);

    const largeArcFlag = endAngleRad - startAngleRad <= Math.PI ? "0" : "1";

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`;
  };

  return (
    <div class="flex justify-center items-center bg-gray-100">
      <svg width="400" height="400" viewBox="0 0 390 390">
        <circle cx={centerX} cy={centerY} r={outerRadius} fill="#000" stroke="#000" stroke-width="4" />
        
        <For each={DART_BOARD_NUMBERS}>
          {(number, index) => {
            const startAngle = index() * 18 - 9;
            const endAngle = (index() + 1) * 18 - 9;
            const isEven = index() % 2 === 0;
            
            return (
              <>
                {/* Outer single segment */}
                <path
                  d={createSegmentPath(startAngle, endAngle, doubleOuterRadius, outerRadius)}
                  fill={isEven ? "#000" : "#f5f5dc"}
                  stroke="#fff"
                  stroke-width="0"
                  class="cursor-pointer hover:opacity-80"
                  onClick={() => onScore(number, 1)}
                />
                
                {/* Double segment */}
                <path
                  d={createSegmentPath(startAngle, endAngle, doubleInnerRadius, doubleOuterRadius)}
                  fill={isEven ? "#dc2626" : "#16a34a"}
                  stroke="#fff"
                  stroke-width="1"
                  class="cursor-pointer hover:opacity-80"
                  onClick={() => onScore(number, 2)}
                />
                
                {/* Inner single segment */}
                <path
                  d={createSegmentPath(startAngle, endAngle, trebleOuterRadius, doubleInnerRadius)}
                  fill={isEven ? "#000" : "#f5f5dc"}
                  stroke="#fff"
                  stroke-width="1"
                  class="cursor-pointer hover:opacity-80"
                  onClick={() => onScore(number, 1)}
                />
                
                {/* Treble segment */}
                <path
                  d={createSegmentPath(startAngle, endAngle, trebleInnerRadius, trebleOuterRadius)}
                  fill={isEven ? "#dc2626" : "#16a34a"}
                  stroke="#fff"
                  stroke-width="1"
                  class="cursor-pointer hover:opacity-80"
                  onClick={() => onScore(number, 3)}
                />
                
                {/* Inner single segment */}
                <path
                  d={createSegmentPath(startAngle, endAngle, outerBullRadius, trebleInnerRadius)}
                  fill={isEven ? "#000" : "#f5f5dc"}
                  stroke="#fff"
                  stroke-width="1"
                  class="cursor-pointer hover:opacity-80"
                  onClick={() => onScore(number, 1)}
                />
                
                {/* Number text */}
                <text
                  x={centerX + (doubleOuterRadius + outerRadius) / 2 * Math.cos((startAngle + 9 - 90) * Math.PI / 180)}
                  y={centerY + (doubleOuterRadius + outerRadius) / 2 * Math.sin((startAngle + 9 - 90) * Math.PI / 180)}
                  text-anchor="middle"
                  dominant-baseline="middle"
                  fill={isEven ? "#fff" : "#000"}
                  font-size="16"
                  font-weight="bold"
                  class="pointer-events-none"
                >
                  {number}
                </text>
              </>
            );
          }}
        </For>
        
        {/* Outer bull (25 points) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerBullRadius}
          fill="#16a34a"
          stroke="#fff"
          stroke-width="2"
          class="cursor-pointer hover:opacity-80"
          onClick={() => onScore(25, 1)}
        />
        
        {/* Inner bull/bullseye (50 points) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={bullseyeRadius}
          fill="#dc2626"
          stroke="#fff"
          stroke-width="2"
          class="cursor-pointer hover:opacity-80"
          onClick={() => onScore(50, 1)}
        />
      </svg>
    </div>
  );
};

export default DartBoard;