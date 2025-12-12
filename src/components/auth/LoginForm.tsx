import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Błąd logowania");
      }

      // Przekieruj po udanym logowaniu
      window.location.href = "/generate";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Zaloguj się</CardTitle>
        <CardDescription>Wprowadź swoje dane aby się zalogować</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="twoj@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 8 znaków"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logowanie..." : "Zaloguj się"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Nie masz konta?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Zarejestruj się
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
