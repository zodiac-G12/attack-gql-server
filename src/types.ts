export type Book = {
  id: number
  title: string
  author: {
    id: number
  }
}

export type Books = Array<Book>

export type Author = {
  id: number
  name: string
  books: Array<{
    id: number
  }>
}

export type Authors = Array<Author>
