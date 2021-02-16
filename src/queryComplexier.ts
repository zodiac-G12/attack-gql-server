import queryComplexity, { simpleEstimator } from 'graphql-query-complexity';

export const defaultComplexity: number = 1;

export const queryComplexier = (maximumComplexity: number) => queryComplexity({
  estimators: [
    simpleEstimator({defaultComplexity})
  ],
  maximumComplexity,
  onComplete: (complexity: number) => {
    console.log('Query Complexity:', complexity);
  },
})
