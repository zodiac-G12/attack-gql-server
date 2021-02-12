import { ApolloServer, gql } from 'apollo-server';
import depthLimit from 'graphql-depth-limit';
import queryComplexity from 'graphql-query-complexity';
import { simpleEstimator } from 'graphql-query-complexity';
import costAnalysis from 'graphql-cost-analysis';

const qc = queryComplexity({
  estimators: [
    simpleEstimator({defaultComplexity: 1})
  ],
  maximumComplexity: 10,
  onComplete: (complexity: number) => {console.log('Query Complexity:', complexity);},
})

    // queryComplexity({
    //   estimators: [
    //     // Configure your estimators
    //     simpleEstimator({defaultComplexity: 1})
    //   ],
    //   maximumComplexity: 1000,
    //   onComplete: (complexity) => {console.log('Query Complexity:', complexity);},
    // })

const ca = costAnalysis({
  defaultCost: 1,
  maximumCost: 10,
  onComplete: (complexity: number) => {console.log('Query Complexity:', complexity);},
});


// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.

  type Book {
    id: Int!
    title: String!
    author: Author!
  }

  type Author {
    id: Int!
    name: String!
    books: [Book!]!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).

  type Query {
    books: [Book]
    authors: [Author]
    # book(id: ID!): Book
    # author(id: ID!): Author
  }
`;

type Book = {
  id: number
  title: string
  author: {
    id: number
  }
}

type Books = Array<Book>

type Author = {
  id: number
  name: string
  books: Array<{
    id: number
  }>
}

type Authors = Array<Author>

const books: Books = [
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

const authors: Authors = [
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

let dbCount: number = 0;

const findByIdBook = (id: number): Book => {
  dbCount += books.length;
  console.log(dbCount);
  return books.filter(book => book.id === id)[0];
}

const findbyIdAuthor = (id: number): Author => {
  dbCount += authors.length;
  console.log(dbCount);
  return authors.filter(author => author.id === id)[0];
}

// const formalizeBook = (book, id) => {
//   if (!book) throw new Error(`book is not Exist. id = ${id}`);
//   book.author = findbyIdAuthor(book.author.id);
//   console.log(dbCount);
//   return book;
// }
//
// const formalizeAuthor = (author, id) => {
//   if (!author) throw new Error(`author is not Exist. id = ${id}`);
//   author.books = author.books.map(aook => {
//     dbCount++;
//     const book = findByIdBook(aook.id);
//     if (!book) throw new Error(`author.books have not Exist book. id = ${aook.id}`);
//     return book;
//   });
//   console.log(dbCount);
//   return author;
// }

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
// const resolvers = {
//   Query: {
//     books: () => {
//       dbCount = 0;
//       return books.map(book => {
//         dbCount++;
//         return formalizeBook(book);
//       });
//     },
//     authors: () => {
//       dbCount = 0;
//       return authors.map(author => {
//         dbCount++;
//         return formalizeAuthor(author);
//       });
//     },
//     book: (_, params) => {
//       dbCount = 0;
//       return formalizeBook(findByIdBook(parseInt(params.id)), params.id);
//     },
//     author: (_, params) => {
//       dbCount = 0;
//       return formalizeAuthor(findbyIdAuthor(parseInt(params.id)), params.id);
//     },
//   },
// };

// SelectionSet: https://www.apollographql.com/blog/the-anatomy-of-a-graphql-query-6dffa9e9e747/

const selectionCount = (selectionSet: any): number => {
  return selectionSet ? (JSON.stringify(selectionSet).match(new RegExp("selections", "g")) || []).length : 0;
}

const complexityCal = (selectionSet: any): number => {
  return selectionCount(selectionSet);
}

const resolvers = {
  Query: {
    books (parent, args, context, info) {
      console.log(parent, args, context, info);
      return books;
    },
    authors: () => authors,
  },
  Book: {
    author (parent, args, context, info) {
      console.log(parent, args, context, info);
      const complexity = complexityCal(info.fieldNodes[0].selectionSet);
      // if (info.fieldNodes[0].loc.end > 500) {
      //   throw new Error(`Error: ${info.fieldNodes[0].loc.end}`);
      // }
      //console.log(info.selectionSet.selections.reduce())

      // TODO ネストの深さが出力される
      console.log(`complexity: ${complexity}`);
      return findbyIdAuthor(parent.author.id);
    },
  },
  Author: {
    books (parent, args, context, info: any) {
      const complexity = complexityCal(info.fieldNodes[0].selectionSet);
      console.log(`complexity: ${complexity}`);
      return parent.books.map((book: Book) => findByIdBook(book.id));
    }
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    depthLimit(10, {}, (res: any) => {
      console.log(res)
    }),

    //qc,

    ca,

    // costAnalyzer,
    // queryComplexity({
    //   estimators: [
    //     // Configure your estimators
    //     simpleEstimator({defaultComplexity: 1})
    //   ],
    //   maximumComplexity: 1000,
    //   onComplete: (complexity) => {console.log('Query Complexity:', complexity);},
    // })
  ],
  //tracing: true
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
