import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Walidacja hasła
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    if (password.length < 8) {
      setError("Hasło musi mieć minimum 8 znaków");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Błąd rejestracji");
      }

      // Przekieruj po udanej rejestracji
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
        <CardTitle>Zarejestruj się</CardTitle>
        <CardDescription>Stwórz nowe konto aby rozpocząć naukę</CardDescription>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Powtórz hasło"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Rejestracja..." : "Zarejestruj się"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Masz już konto?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Zaloguj się
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
