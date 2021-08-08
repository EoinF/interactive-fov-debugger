import { generate, Observable } from "rxjs";
import { endWith } from "rxjs/operators";
import { Vector2 } from "../types";

type BresenhamLineConfig = {
  deltaX: number;
  deltaY: number;
  xStep: number;
  yStep: number;
  isSteep: boolean;
  startState: { x: number; y: number; error: number };
};

const getBresenhamLineConfig = (
  from: Vector2,
  to: Vector2
): BresenhamLineConfig => {
  const isSteep = Math.abs(to.y - from.y) > Math.abs(to.x - from.x);
  let fromX = isSteep ? from.y : from.x;
  let fromY = isSteep ? from.x : from.y;
  let toX = isSteep ? to.y : to.x;
  let toY = isSteep ? to.x : to.y;

  const deltaX = Math.abs(toX - fromX);
  const deltaY = Math.abs(toY - fromY);

  const xStep = fromX > toX ? -1 : 1;
  const yStep = fromY > toY ? -1 : 1;

  return {
    deltaX,
    deltaY,
    xStep,
    yStep,
    isSteep,
    startState: { x: fromX, y: fromY, error: deltaX * 0.5 },
  };
};

export const lineGenerator = (
  from: Vector2,
  to: Vector2
): Observable<{ x: number; y: number }> => {
  const { startState, deltaX, deltaY, xStep, yStep, isSteep } =
    getBresenhamLineConfig(from, to);
  // console.log(`line from ${from.x},${from.y} to ${to.x},${to.y}`);

  const compareSteep = ({ x }: { x: number }) => x != to.y;

  const compareNormal = ({ x }: { x: number }) => x != to.x;

  const shouldContinue = isSteep ? compareSteep : compareNormal;

  return generate(
    startState,
    shouldContinue,
    ({ x, y, error }) => {
      let currentY = y;
      error -= deltaY;
      if (error < 0) {
        currentY += yStep;
        error += deltaX;
      }

      return { x: x + xStep, y: currentY, error };
    },
    ({ x, y }) => (isSteep ? { x: y, y: x } : { x, y })
  ).pipe(endWith({ x: to.x, y: to.y }));
};
