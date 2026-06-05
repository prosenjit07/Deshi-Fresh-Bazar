"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogOut, User as UserIcon } from "lucide-react";

type AuthUser = {
  name: string;
  email: string;
  image?: string;
};

type AuthModalProps = {
  user: AuthUser | null;
  onLogout: () => Promise<void>;
};

export default function AuthModal({ user, onLogout }: AuthModalProps) {
  const [open, setOpen] = useState(false);

  const initials = useMemo(() => {
    const value = user?.name?.trim();
    if (!value) return "";
    const parts = value.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (first + last).toUpperCase();
  }, [user?.name]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full p-0 hover:bg-gray-100"
          aria-label={user ? "Account menu" : "Login or register"}
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt="Profile"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200">
              {initials ? (
                <span className="text-xs font-semibold">{initials}</span>
              ) : (
                <UserIcon className="h-4 w-4" />
              )}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] max-w-[420px] p-0 overflow-hidden">
        <DialogHeader className="border-b bg-gradient-to-b from-gray-50 to-white px-6 py-5">
          <DialogTitle className="text-lg font-semibold">
            {user ? "Account" : "Welcome"}
          </DialogTitle>
          {user ? (
            <div className="mt-3 flex items-center gap-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-200"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 ring-1 ring-gray-200">
                  {initials || "U"}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900">
                  {user.name}
                </div>
                <div className="truncate text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-600">
              Login or Sign Up to continue.
            </div>
          )}
        </DialogHeader>

        <div className="px-6 py-6">
          {user ? (
            <div className="grid gap-3">
              <Button asChild variant="outline" className="justify-between">
                <Link href="/profile" onClick={() => setOpen(false)}>
                  <span>Profile</span>
                  <span className="text-gray-400">→</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/orders" onClick={() => setOpen(false)}>
                  <span>My Orders</span>
                  <span className="text-gray-400">→</span>
                </Link>
              </Button>
              <Button
                variant="destructive"
                className="mt-2"
                onClick={async () => {
                  setOpen(false);
                  await onLogout();
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              <Button asChild className="bg-green-700 hover:bg-green-800">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register" onClick={() => setOpen(false)}>
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

