export type Member = {
  id: string;
  project_id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};
