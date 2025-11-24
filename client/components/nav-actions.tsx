"use client";

import * as React from "react";
import { Share } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "./toggle-mode";
import Login from "./o-auth-button";
import { getCurrentUser } from "@/services/auth";
import { User } from "@/types/user";

export function NavActions() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  
  React.useEffect(() => {
    const fetchUser = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {        
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await getCurrentUser(token);
        setUser(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (!user && loading) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      {user && (
        <Button variant="ghost" className="rounded-full cursor-pointer">
          Share
          <Share />
        </Button>
      )}
      {!user && !loading && <Login />}
      <ModeToggle />
    </div>
  );
}
