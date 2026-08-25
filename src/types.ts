export interface Poem {
  id: string;
  title: string;
  content: string[];
  poet: string;
  category: string;
  createdAt?: number;
  orderIndex?: number;
}

export interface Poet {
  name: string;
  bio?: string;
}
