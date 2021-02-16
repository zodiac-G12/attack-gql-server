import depthLimit from 'graphql-depth-limit';

export const depthLimiter = (maxDepth: number) => depthLimit(
  maxDepth,
  {},
  depths => console.log(depths)
);
