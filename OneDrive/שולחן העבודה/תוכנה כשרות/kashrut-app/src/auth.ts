import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            passwordHash: true,
            organizationId: true,
            canManageClients: true,
            canManageFinance: true,
            canManageCertificates: true,
            canManageSalary: true,
            canManageScheduling: true,
            canManageHolograms: true,
            canViewReports: true,
            canManageSettings: true,
          },
        });

        if (!user) return null;

        // If no password set yet, allow any password (first-time setup)
        if (user.passwordHash) {
          const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
          if (!valid) return null;
        }

        // Log successful login
        await prisma.activityLog.create({
          data: {
            organizationId: user.organizationId,
            entityType: "user",
            entityId: user.id,
            action: "login",
            description: `כניסה למערכת — ${user.name} (${user.email})`,
            userId: user.id,
          },
        }).catch(() => {});

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          canManageClients: user.canManageClients,
          canManageFinance: user.canManageFinance,
          canManageCertificates: user.canManageCertificates,
          canManageSalary: user.canManageSalary,
          canManageScheduling: user.canManageScheduling,
          canManageHolograms: user.canManageHolograms,
          canViewReports: user.canViewReports,
          canManageSettings: user.canManageSettings,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as never as { role: string }).role;
        token.organizationId = (user as never as { organizationId: string }).organizationId;
        token.canManageClients = (user as never as { canManageClients: boolean }).canManageClients;
        token.canManageFinance = (user as never as { canManageFinance: boolean }).canManageFinance;
        token.canManageCertificates = (user as never as { canManageCertificates: boolean }).canManageCertificates;
        token.canManageSalary = (user as never as { canManageSalary: boolean }).canManageSalary;
        token.canManageScheduling = (user as never as { canManageScheduling: boolean }).canManageScheduling;
        token.canManageHolograms = (user as never as { canManageHolograms: boolean }).canManageHolograms;
        token.canViewReports = (user as never as { canViewReports: boolean }).canViewReports;
        token.canManageSettings = (user as never as { canManageSettings: boolean }).canManageSettings;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.canManageClients = token.canManageClients as boolean;
        session.user.canManageFinance = token.canManageFinance as boolean;
        session.user.canManageCertificates = token.canManageCertificates as boolean;
        session.user.canManageSalary = token.canManageSalary as boolean;
        session.user.canManageScheduling = token.canManageScheduling as boolean;
        session.user.canManageHolograms = token.canManageHolograms as boolean;
        session.user.canViewReports = token.canViewReports as boolean;
        session.user.canManageSettings = token.canManageSettings as boolean;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
});
