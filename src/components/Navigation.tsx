import { useState } from "react";
import { Button } from "./ui/button";

interface NavigationProps {
  user?: {
    email?: string;
  } | null;
  currentPath: string;
}

export default function Navigation({ user, currentPath }: NavigationProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      window.location.href = "/login";
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-xl font-bold text-gray-900">
                FlashLearn AI
              </a>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/generate"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentPath === "/generate"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Generuj
                </a>
                <a
                  href="/flashcards"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentPath === "/flashcards"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Moja Kolekcja
                </a>
                <a
                  href="/study"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentPath === "/study"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Nauka
                </a>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.email}</span>
                <Button onClick={handleLogout} disabled={loggingOut} variant="outline" size="sm">
                  {loggingOut ? "Wylogowywanie..." : "Wyloguj"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a href="/login" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                  Zaloguj się
                </a>
                <a href="/register">
                  <Button size="sm">Zarejestruj się</Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
