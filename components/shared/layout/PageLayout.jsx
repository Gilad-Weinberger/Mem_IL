"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ButtonPrimary from "../ui/ButtonPrimary";

const PageLayout = ({ children }) => {
  const pathname = usePathname();
  const { user, userStatus, logout } = useAuth();

  const isActive = (path) => pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  Memoery IL
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/soldiers"
                  className={`${
                    isActive("/soldiers")
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Soldiers
                </Link>
                {user && (
                  <>
                    <Link
                      href="/profile"
                      className={`${
                        isActive("/profile")
                          ? "border-blue-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Profile
                    </Link>
                    {userStatus === "admin" && (
                      <Link
                        href="/admin"
                        className={`${
                          isActive("/admin")
                            ? "border-blue-500 text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      >
                        Admin
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <ButtonPrimary onClick={logout}>Logout</ButtonPrimary>
              ) : (
                <Link href="/auth/login">
                  <ButtonPrimary>Login</ButtonPrimary>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Memoery IL. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
