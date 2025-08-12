"use client";
import Link from "next/link";
import {
  ChefHat,
  BookOpen,
  ListTodo,
  UserCheck,
  Users,
  House,
  Soup,
  Settings,
  LogOut,
  Bookmark,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const userKitchenItems = [
  {
    title: "My Kitchen",
    url: "/user/my-kitchen",
    icon: ChefHat,
  },
  {
    title: "My Recipes",
    url: "/user/my-recipes",
    icon: BookOpen,
  },
  {
    title: "Saved Recipes",
    url: "/recipes/saved",
    icon: Bookmark,
  },
  {
    title: "My Community Posts",
    url: "/user/my-community-posts",
    icon: UserCheck,
  },
];

const userNavigation = [
  {
    title: "Home",
    url: "/",
    icon: House,
  },
  {
    title: "Community",
    url: "/community",
    icon: Users,
  },
  {
    title: "Recipes",
    url: "/recipes",
    icon: Soup,
  },
];

export default function AppSidebar() {
  const handleSignout = () => {
    // Handle sign out logic here
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/signin"; // Redirect to sign-in page
  };
  return (
    <Sidebar className="min-h-screen border-r border-gray-200 bg-white dark:bg-gray-950">
      <SidebarContent>
        {/* Logo */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <h1 className="text-3xl font-light tracking-wider">
                  <span className="text-[#1E1E1E]">share</span>
                  <span className="font-semibold text-yellow-500">recipe</span>
                </h1>
              </Link>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* User Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-yellow-500">
            Your Kitchen
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userKitchenItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 hover:text-yellow-500 transition"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-yellow-500">
            Navigate
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 hover:text-yellow-500 transition"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Settings Section */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-yellow-500">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="Settings">
                <SidebarMenuButton asChild>
                  <a
                    href="/user/settings"
                    className="flex items-center gap-3 hover:text-yellow-500 transition"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="Sign Out">
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleSignout}
                    className="flex items-center gap-3 hover:text-yellow-500 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
