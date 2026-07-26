// Mirrors the backend's BookResponse DTO exactly - field names must match
// the JSON keys Jackson produces, or the values will come through as undefined.
export interface Book {
  id: number;
  title: string;
  isbn: string;
  available: boolean;
  authorId: number;
  authorName: string;
}

// Mirrors the backend's BookRequest DTO - what we SEND when creating/updating.
export interface BookRequest {
  title: string;
  isbn: string;
  authorId: number;
}
