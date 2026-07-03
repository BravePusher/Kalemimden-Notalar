export interface Poem {
  id: string;
  title: string;
  content: string[];
  poet: string;
  category: string;
}

export interface Poet {
  name: string;
  bio?: string;
}
