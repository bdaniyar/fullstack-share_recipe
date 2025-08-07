"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/user/appsidebar";
import { Header } from "@/components/user/appheader";


export default function KitchenDashboard() {
  const [activeTab, setActiveTab] = useState("Your Kitchen");
  const user = {
    name: "Mit Patel",
    role: "Master Chef", // Other examples: "Chef", "Foodie", "Rising Star"
    username: "mit_cooks",
  };

  return (
    <div className="flex min-h-screen">
       
      <div className="flex-1 flex flex-col">
        My Lists
      </div>
    </div>
  );
}
