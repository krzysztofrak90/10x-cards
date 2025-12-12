import { test, expect } from '@playwright/test';

test.describe('FlashLearn AI - User Flow', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test('complete user journey: register, login, create flashcard, edit, delete', async ({ page }) => {
    // 1. Otwórz stronę główną
    await page.goto('/');
    await expect(page).toHaveTitle(/FlashLearn AI/);

    // 2. Przejdź do rejestracji
    await page.click('text=Zarejestruj się');
    await expect(page).toHaveURL('/register');

    // 3. Zarejestruj nowe konto
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // 4. Sprawdź przekierowanie do strony generowania
    await page.waitForURL('/generate', { timeout: 10000 });
    await expect(page).toHaveURL('/generate');

    // 5. Przejdź do "Moja Kolekcja"
    await page.click('text=Moja Kolekcja');
    await expect(page).toHaveURL('/flashcards');

    // 6. Dodaj nową fiszkę
    await page.click('text=Dodaj fiszkę');

    // Wypełnij formularz
    await page.fill('textarea[id="front"]', 'Test Question');
    await page.fill('textarea[id="back"]', 'Test Answer');
    await page.click('button[type="submit"]:has-text("Dodaj fiszkę")');

    // 7. Sprawdź czy fiszka się pojawiła
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Test Question')).toBeVisible();

    // 8. Pokaż odpowiedź (kliknij w fiszkę)
    await page.click('text=Test Question');
    await expect(page.locator('text=Test Answer')).toBeVisible();

    // 9. Edytuj fiszkę
    await page.click('button:has-text("Edytuj")');
    await page.fill('textarea[id="front"]', 'Updated Question');
    await page.click('button[type="submit"]:has-text("Zapisz zmiany")');

    // 10. Sprawdź czy zmiany zostały zapisane
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Updated Question')).toBeVisible();

    // 11. Usuń fiszkę
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Usuń")');

    // 12. Sprawdź czy fiszka została usunięta
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Updated Question')).not.toBeVisible();

    // 13. Wyloguj się
    await page.click('button:has-text("Wyloguj")');
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');

    // 14. Zaloguj się ponownie
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 15. Sprawdź przekierowanie po zalogowaniu
    await page.waitForURL('/generate');
    await expect(page).toHaveURL('/generate');
  });

  test('should not allow access to protected routes without login', async ({ page }) => {
    // Próba dostępu do /generate bez logowania
    await page.goto('/generate');

    // Powinno przekierować do logowania
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });

  test('should display login error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Sprawdź komunikat o błędzie
    await expect(page.locator('text=Nieprawidłowy email lub hasło')).toBeVisible();
  });
});
