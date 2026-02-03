import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import {
  hasClaimedDailyBonusToday,
  createDailyLoginBonus,
} from "@/lib/transactions";
import { updateDailyStreak } from "@/lib/streak";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  /**
   * 🔐 AUTH PROVIDERS
   */
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();

          // Find user including password
          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user) return null;

          const isPasswordValid = await user.comparePassword(
            credentials.password
          );

          if (!isPasswordValid) return null;

          /**
           * 🎁 Daily login bonus (never block login)
           */
          try {
            const hasClaimed = await hasClaimedDailyBonusToday(
              user._id.toString()
            );

            if (!hasClaimed) {
              await createDailyLoginBonus(user._id.toString());
            }
          } catch (err) {
            console.error("Daily bonus error:", err);
          }

          /**
           * 🔥 Update daily streak (never block login)
           */
          let updatedStreak = 0;
          try {
            updatedStreak = await updateDailyStreak(user._id.toString());
          } catch (err) {
            console.error("Daily streak error:", err);
          }

          /**
           * ✅ RETURN ONLY ESSENTIAL SERIALIZABLE DATA
           */
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name ?? undefined,
            role: user.role,
            taskPoints: user.taskPoints, // Include actual balance from DB
            welcomeBonusGranted: user.welcomeBonusGranted, // Include bonus status
            dailyStreak: updatedStreak, // Include updated daily streak
          };
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],

  /**
   * 🔑 SESSION CONFIG
   */
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  /**
   * 🔁 CALLBACKS - Keep minimal to prevent header overflow
   */
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Persist user data from database
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.taskPoints = user.taskPoints;
        token.welcomeBonusGranted = user.welcomeBonusGranted;
        token.dailyStreak = user.dailyStreak;
      }
      
      // Handle session updates
      if (trigger === "update" && session) {
        token.id = session.user.id;
      }
      
      return token;
    },

    async session({ session, token }) {
      // Attach user data from token to session
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).taskPoints = token.taskPoints as number;
        (session.user as any).welcomeBonusGranted = token.welcomeBonusGranted as boolean;
        (session.user as any).dailyStreak = token.dailyStreak as number;
      }
      return session;
    },
  },

  /**
   * 🔀 CUSTOM PAGES
   */
  pages: {
    signIn: "/auth/login",
  },

  /**
   * 🔐 SECRET
   */
  secret: process.env.NEXTAUTH_SECRET,
});






// import NextAuth from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
// import connectDB from '@/lib/mongodb';
// import User, { IUser } from '@/models/User';
// import { hasClaimedDailyBonusToday, createDailyLoginBonus } from '@/lib/transactions';

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     Credentials({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         try {
//           await connectDB();
          
//           const user = await User.findOne({ email: credentials.email }).select('+password');
          
//           if (!user) {
//             return null;
//           }

//           const isPasswordValid = await user.comparePassword(credentials.password);
          
//           if (!isPasswordValid) {
//             return null;
//           }

//           // Check and award daily login bonus if not already claimed today
//           try {
//             const hasClaimed = await hasClaimedDailyBonusToday(user._id.toString());
//             if (!hasClaimed) {
//               await createDailyLoginBonus(user._id.toString());
//             }
//           } catch (error) {
//             console.error('Error handling daily login bonus:', error);
//             // Don't fail login if bonus creation fails
//           }

//           return {
//             id: user._id.toString(),
//             email: user.email,
//             name: user.name,
//             username: user.username,
//             avatarUrl: user.avatarUrl,
//             taskPoints: user.taskPoints || 50,
//             tasksCompleted: user.tasksCompleted || 0,
//           };
//         } catch (error) {
//           console.error('Auth error:', error);
//           return null;
//         }
//       }
//     })
//   ],
//   session: {
//     strategy: 'jwt',
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.username = user.username;
//         token.avatarUrl = user.avatarUrl;
//         token.taskPoints = user.taskPoints;
//         token.tasksCompleted = user.tasksCompleted;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id as string;
//         session.user.username = token.username as string;
//         session.user.avatarUrl = token.avatarUrl as string;
//         session.user.taskPoints = token.taskPoints as number;
//         session.user.tasksCompleted = token.tasksCompleted as number;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: '/auth/login',
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// });
