import { useEffect, useLayoutEffect, useRef, useState } from "react";

const DOT_COUNT = 20;
const STEP_DURATION = 800;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function createDotPath(
  containerWidth,
  containerHeight,
  startingDot,
  excludedFirstDirection
) {
  const dots = [
    startingDot ?? {
      x: 0.12 + Math.random() * 0.76,
      y: 0.06 + Math.random() * 0.88,
    },
  ];
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  let currentDirection;
  let stepsRemainingInDirection = 0;

  while (dots.length < DOT_COUNT) {
    const previousDot = dots[dots.length - 1];
    const distanceInPixels = containerWidth * 0.04;
    const xDistance = distanceInPixels / containerWidth;
    const yDistance = distanceInPixels / containerHeight;
    const availableDirections = directions.filter(({ x, y }) => {
      const nextX = previousDot.x + x * xDistance;
      const nextY = previousDot.y + y * yDistance;

      return nextX >= 0.04 && nextX <= 0.96 && nextY >= 0.025 && nextY <= 0.975;
    });
    const canKeepMoving = availableDirections.some(
      ({ x, y }) => x === currentDirection?.x && y === currentDirection?.y
    );

    if (stepsRemainingInDirection === 0 || !canKeepMoving) {
      const turnDirections = availableDirections.filter(({ x, y }) => {
        if (!currentDirection && excludedFirstDirection) {
          return (
            x !== excludedFirstDirection.x || y !== excludedFirstDirection.y
          );
        }

        return x !== -currentDirection?.x || y !== -currentDirection?.y;
      });

      currentDirection =
        turnDirections[Math.floor(Math.random() * turnDirections.length)] ??
        availableDirections[0];
      stepsRemainingInDirection = 2 + Math.floor(Math.random() * 3);
    }

    dots.push({
      x: clamp(previousDot.x + currentDirection.x * xDistance, 0.04, 0.96),
      y: clamp(previousDot.y + currentDirection.y * yDistance, 0.025, 0.975),
    });
    stepsRemainingInDirection -= 1;
  }

  return dots;
}

function getAngle(from, to) {
  if (!to) return 0;

  return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
}

/**
 * 首頁背景原型：一隻原創街機風格角色沿著 20 顆連續豆子的路徑移動。
 */
export default function PacmanBackground() {
  const backgroundRef = useRef(null);
  const containerSizeRef = useRef({ width: 0, height: 0 });
  const [dots, setDots] = useState([]);
  const dotsRef = useRef(dots);
  const [activeDotIndex, setActiveDotIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    dotsRef.current = dots;
  }, [dots]);

  useLayoutEffect(() => {
    const background = backgroundRef.current;
    if (!background) return undefined;

    const { width, height } = background.getBoundingClientRect();
    if (width === 0 || height === 0) return undefined;

    const initialDots = createDotPath(width, height);
    containerSizeRef.current = { width, height };
    dotsRef.current = initialDots;
    setDots(initialDots);
    setActiveDotIndex(0);

    const revealFrame = window.requestAnimationFrame(() => setIsReady(true));
    return () => window.cancelAnimationFrame(revealFrame);
  }, []);

  useEffect(() => {
    if (!isReady) return undefined;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    if (reducedMotionQuery.matches) return undefined;

    const moveTimer = window.setInterval(() => {
      setActiveDotIndex((currentIndex) => {
        const currentDots = dotsRef.current;

        if (currentIndex === currentDots.length - 1) {
          const lastDot = currentDots[currentDots.length - 1];
          const previousDot = currentDots[currentDots.length - 2];
          const arrivalDirection = {
            x: Math.sign(lastDot.x - previousDot.x),
            y: Math.sign(lastDot.y - previousDot.y),
          };

          setDots(
            createDotPath(
              containerSizeRef.current.width,
              containerSizeRef.current.height,
              lastDot,
              arrivalDirection
            )
          );
          return 0;
        }

        return currentIndex + 1;
      });
    }, STEP_DURATION);

    return () => window.clearInterval(moveTimer);
  }, [isReady]);

  const activeDot = dots[activeDotIndex];
  const previousDot = dots[Math.max(activeDotIndex - 1, 0)];
  const nextDot = dots[activeDotIndex + 1];
  const direction = getAngle(
    activeDotIndex === 0 ? activeDot : previousDot,
    activeDotIndex === 0 ? nextDot : activeDot
  );

  return (
    <div
      ref={backgroundRef}
      aria-hidden="true"
      className={`pacman-background ${isReady ? "is-ready" : ""}`}
    >
      {dots.map((dot, index) => (
        <span
          key={`${dot.x}-${dot.y}`}
          className={`pacman-background-dot ${index < activeDotIndex ? "is-eaten" : ""}`}
          style={{ left: `${dot.x * 100}%`, top: `${dot.y * 100}%` }}
        />
      ))}
      {activeDot && (
        <span
          className="pacman-background-character"
          style={{
            left: `${activeDot.x * 100}%`,
            top: `${activeDot.y * 100}%`,
            "--pacman-angle": `${direction}deg`,
          }}
        >
          <span className="pacman-background-mouth" />
        </span>
      )}
    </div>
  );
}
