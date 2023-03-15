export type SearchParams = {
  text?: string;
  tags?: string[];
  mentions?: string[];
  isReply?: boolean;
  likedBy?: string[];
};

export type CreateParams = {
  text: string;
  userId: string;
  parentId?: string;
  mediaBuffer?: Buffer;
  mediaType?: string;
};
