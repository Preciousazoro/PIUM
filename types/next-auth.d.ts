import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      username?: string;
      avatarUrl?: string;
      taskPoints?: number;
      tasksCompleted?: number;
      welcomeBonusGranted?: boolean;
      dailyStreak?: number;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role?: string;
    username?: string;
    avatarUrl?: string;
    taskPoints?: number;
    tasksCompleted?: number;
    welcomeBonusGranted?: boolean;
    dailyStreak?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
    username?: string;
    avatarUrl?: string;
    taskPoints?: number;
    tasksCompleted?: number;
    welcomeBonusGranted?: boolean;
    dailyStreak?: number;
  }
}
