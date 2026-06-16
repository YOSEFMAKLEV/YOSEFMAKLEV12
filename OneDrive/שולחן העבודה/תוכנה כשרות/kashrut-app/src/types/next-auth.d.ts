import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      organizationId: string;
      canManageClients: boolean;
      canManageFinance: boolean;
      canManageCertificates: boolean;
      canManageSalary: boolean;
      canManageScheduling: boolean;
      canManageHolograms: boolean;
      canViewReports: boolean;
      canManageSettings: boolean;
    };
  }
}
