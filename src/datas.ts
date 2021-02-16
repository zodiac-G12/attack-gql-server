import { Books, Authors } from './types';

export const books: Books = [
  {
    id: 1,
    title: 'The Awakening',
    author: {
      id: 1,
    }
  },
  {
    id: 2,
    title: 'City of Glass',
    author: {
      id: 2,
    }
  },
];

export const authors: Authors = [
  {
    id: 1,
    name: 'Kate Chopin',
    books: [
      {
        id: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'Paul Auster',
    books: [
      {
        id: 2,
      },
    ],
  }
];
