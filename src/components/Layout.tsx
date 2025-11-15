import { Building2Icon, HomeIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/router";

const navigationItems = [
  {
    title: "Beranda",
    url: "/",
    icon: HomeIcon,
  },
];

function Layout({ children }: { children?: React.ReactNode }) {
  const { pathname } = useRouter();
  const { user, isLoading, logout } = useAuthContext();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="shrink-0 flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2Icon className="size-4" />
            </div>
            <span className="shrink-0 font-semibold">Quizzy</span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  isActive={pathname.replace(/\/$/, "") === item.url}
                  asChild
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <Button onClick={logout} className="w-full justify-start">
            <LogOutIcon />
            <span>{isLoading ? "Signing out..." : "Sign out"}</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">
            Welcome{" "}
            <span className="font-bold underline">
              {user ? user.email.split("@")[0] : ""}
            </span>
          </h1>
        </header>

        {/* Main Content */}
        <div className="relative flex flex-1 flex-col gap-4 p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { Layout };
