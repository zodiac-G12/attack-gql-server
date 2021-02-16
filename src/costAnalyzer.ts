import costAnalysis from 'graphql-cost-analysis';

export const defaultCost: number = 1;

export const costAnalyzer = (maximumCost: number) => costAnalysis({
  defaultCost,
  maximumCost,
  onComplete: (cost: number) => {
    console.log('Query Cost:', cost);
  },
});
