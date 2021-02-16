import { ApolloServer } from 'apollo-server';
import { Book, Author } from './types';
import { books, authors } from './datas';
import { typeDefs } from './typeDefs';
import { queryComplexier } from './queryComplexier';
import { costAnalyzer } from './costAnalyzer';
import { depthLimiter } from './depthLimiter';
// FIXME typo
import { orginalRules } from './orginalRules';
let dbCount: number = 0;

const findByIdBook = (id: number): Book => {
  dbCount += books.length;
  console.log(dbCount);
  return books.filter(book => book.id === id)[0];
}

const findByIdAuthor = (id: number): Author => {
  dbCount += authors.length;
  console.log(dbCount);
  return authors.filter(author => author.id === id)[0];
}

const resolvers = {
  Query: {
    books (parent, args, context, info) {
      orginalRules(info, false, true);
      return books;
    },
    authors (parent, args, context, info) {
      orginalRules(info, false, true);
      return authors;
    },
  },
  Book: {
    author (parent, args, context, info) {
      // console.log(parent, args, context, info);
      //const complexity = complexityCal(info.fieldNodes[0].selectionSet);

      // TODO ネストの深さが出力される
      //console.log(`complexity: ${complexity}`);

      return findByIdAuthor(parent.author.id);
    },
  },
  Author: {
    books (parent, args, context, info) {
      //const complexity = complexityCal(info.fieldNodes[0].selectionSet);
      //console.log(`complexity: ${complexity}`);

      return parent.books.map((book: Book) => findByIdBook(book.id));
    }
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
// Docs: https://www.apollographql.com/docs/apollo-server/api/apollo-server/
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    // depthLimiter(11),
    depthLimiter(9),
    queryComplexier(10),
    costAnalyzer(10),
  ],
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
