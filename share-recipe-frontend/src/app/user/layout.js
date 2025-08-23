import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/user/appsidebar";
import AppHeader from "@/components/user/appheader";

export default async function Layout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
