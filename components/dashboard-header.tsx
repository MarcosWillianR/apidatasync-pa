"use client";
import { useSession } from "next-auth/react";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">
        Olá {session?.user.firstName}, Bem vindo de volta 👋
      </h2>
      <div className="hidden md:flex items-center space-x-2">
        <CalendarDateRangePicker />
        <Button>Download</Button>
      </div>
    </div>
  );
}
