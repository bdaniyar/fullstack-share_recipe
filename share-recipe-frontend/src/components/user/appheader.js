"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSelector } from "react-redux";

export default function AppHeader() {
  const user = useSelector((state) => state.user);
  
  return (
    <div className="flex items-center justify-between p-6 gap- border-b bg-white">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>
            {(user.username?.[0] || "U").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold">{user.username}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-yellow-500 text-black">{user.role}</Badge>
        <Badge variant="secondary">Top Contributor</Badge>
      </div>
    </div>
  );
}
