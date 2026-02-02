import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string;
      avatarUrl?: string;
      taskPoints?: number;
      tasksCompleted?: number;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    username?: string;
    avatarUrl?: string;
    taskPoints?: number;
    tasksCompleted?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string;
    avatarUrl?: string;
    taskPoints?: number;
    tasksCompleted?: number;
  }
}
