export type SearchParams = {
  text?: string;
  tags?: string[];
  mentions?: string[];
  isReply?: boolean;
};

export type CreateParams = {
  text: string;
  parentId?: string;
  userId: string;
};
