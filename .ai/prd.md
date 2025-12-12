# Dokument wymagań produktu (PRD) – FlashLearn AI

## 1. Przegląd produktu
FlashLearn AI to inteligentna aplikacja wspierająca efektywną naukę poprzez automatyczne generowanie i zarządzanie materiałami edukacyjnymi w formie fiszek. System wykorzystuje zaawansowane modele językowe do przekształcania dowolnych treści tekstowych w strukturyzowane pytania i odpowiedzi, umożliwiając użytkownikom błyskawiczne przygotowanie materiałów do nauki.

## 2. Problem użytkownika
Studenci i osoby uczące się często tracą cenny czas na ręczne przygotowywanie fiszek edukacyjnych, co skutkuje frustracją i rezygnacją z tej sprawdzonej metody nauki. Proces ten jest szczególnie czasochłonny przy dużych ilościach materiału, a jakość tworzonych fiszek bywa nierówna. FlashLearn AI rozwiązuje ten problem poprzez automatyzację procesu tworzenia fiszek przy zachowaniu możliwości pełnej personalizacji i kontroli nad treścią.

## 3. Wymagania funkcjonalne

### 3.1. Inteligentne generowanie materiałów edukacyjnych
- Przyjmowanie tekstów o długości 800-12000 znaków (elastyczne limity dostosowane do różnych źródeł)
- Komunikacja z API modeli językowych w celu ekstrakcji kluczowych informacji
- Generowanie zestawu 5-15 fiszek z automatycznym dopasowaniem liczby do objętości materiału
- Prezentacja wygenerowanych propozycji w formie interaktywnej listy
- Możliwość indywidualnej akceptacji, modyfikacji lub odrzucenia każdej fiszki

### 3.2. Pełne zarządzanie kolekcją fiszek
- Intuicyjny formularz do manualnego dodawania fiszek z walidacją długości
- Przegląd wszystkich fiszek w sekcji "Moja Kolekcja" z filtrowaniem i sortowaniem
- Edycja treści fiszek z automatycznym oznaczaniem modyfikacji
- Bezpieczne usuwanie fiszek z potwierdzeniem operacji
- Przypisywanie fiszek do kategorii i tagowanie

### 3.3. System kont użytkowników
- Rejestracja z wykorzystaniem adresu email i bezpiecznego hasła
- Logowanie z walidacją danych dostępowych
- Zarządzanie profilem użytkownika
- Możliwość trwałego usunięcia konta wraz ze wszystkimi powiązanymi danymi

### 3.4. Moduł efektywnej nauki
- Implementacja algorytmu interwałowych powtórek (spaced repetition) z gotowej biblioteki
- System oceny stopnia przyswojenia materiału (łatwe/średnie/trudne)
- Automatyczne planowanie kolejnych sesji nauki na podstawie wydajności użytkownika
- Minimalistyczny interfejs skupiony na koncentracji podczas nauki

### 3.5. Architektura danych
- Relacyjna baza danych zapewniająca integralność i bezpieczeństwo
- Mechanizmy Row Level Security dla izolacji danych użytkowników
- Automatyczne kopie zapasowe i możliwość odzyskiwania danych

### 3.6. Analityka i monitoring
- Rejestrowanie statystyk generowania (liczba wygenerowanych vs. zaakceptowanych fiszek)
- Tracking źródła powstania fiszek (AI bez edycji, AI z edycją, manualne)
- Monitoring długości sesji nauki i częstotliwości korzystania
- Logowanie błędów API dla celów diagnostycznych

### 3.7. Zgodność z regulacjami
- Przetwarzanie danych osobowych zgodnie z wymogami RODO
- Transparentność w zakresie przechowywania i wykorzystywania danych
- Realizacja prawa do dostępu, poprawy i usunięcia danych na żądanie użytkownika

## 4. Granice produktu

### 4.1. Funkcjonalności poza zakresem pierwszej wersji:
- Własnoręcznie opracowany algorytm spaced repetition (używamy sprawdzonej biblioteki open-source)
- System osiągnięć, poziomów i elementów grywalizacyjnych
- Natywne aplikacje mobilne na iOS i Android (focus na progressive web app)
- Bezpośredni import dokumentów w formatach PDF, DOCX, EPUB
- Publiczne REST API dla integracji z zewnętrznymi systemami
- Udostępnianie i współdzielenie zestawów fiszek pomiędzy użytkownikami
- System przypomnień push i email notifications
- Wyszukiwanie full-text z zaawansowanymi filtrami i operatorami
- Wsparcie dla wielu języków interfejsu (tylko angielski i polski w MVP)
- Integracja z zewnętrznymi platformami edukacyjnymi (Moodle, Canvas)

## 5. Historyjki użytkowników

### US-001: Założenie konta w systemie
**Jako:** Nowy użytkownik platformy
**Chcę:** Utworzyć własne konto w aplikacji
**Po to, aby:** Móc korzystać z funkcji generowania fiszek AI i mieć bezpieczny dostęp do moich materiałów edukacyjnych

**Kryteria akceptacji:**
- System prezentuje formularz z polami: email, hasło, potwierdzenie hasła
- Hasło musi spełniać wymagania bezpieczeństwa (minimum 8 znaków)
- Po udanej rejestracji użytkownik otrzymuje wizualne potwierdzenie
- System automatycznie loguje użytkownika i przekierowuje do głównego panelu
- Email musi być unikalny w systemie

### US-002: Autoryzacja w systemie
**Jako:** Posiadacz konta w FlashLearn AI
**Chcę:** Zalogować się do aplikacji używając swoich danych
**Po to, aby:** Uzyskać dostęp do mojej prywatnej kolekcji fiszek i kontynuować naukę

**Kryteria akceptacji:**
- Formularz logowania przyjmuje email i hasło
- Poprawne dane przekierowują do panelu generowania materiałów
- Niepoprawne dane wyświetlają czytelny komunikat błędu
- System zabezpiecza hasła poprzez szyfrowanie
- Po zalogowaniu sesja użytkownika jest bezpiecznie zarządzana

### US-003: Automatyczna kreacja fiszek z tekstu
**Jako:** Zalogowany student
**Chcę:** Wkleić fragment notatek i automatycznie otrzymać propozycje fiszek
**Po to, aby:** Znacząco przyspieszyć proces przygotowania materiałów do nauki bez ręcznego formatowania

**Kryteria akceptacji:**
- Interfejs udostępnia obszar tekstowy z licznikiem znaków
- System akceptuje teksty o długości 800-12000 znaków
- Po aktywacji funkcji następuje komunikacja z API modelu językowego
- Wygenerowane fiszki wyświetlają się jako lista z opcjami akcji
- Gdy występują problemy techniczne, użytkownik widzi informacyjny komunikat
- Wyświetlany jest loader podczas przetwarzania żądania

### US-004: Selekcja i akceptacja wygenerowanych materiałów
**Jako:** Użytkownik przeglądający wygenerowane przez AI fiszki
**Chcę:** Indywidualnie wybierać które propozycje zapisać w mojej kolekcji
**Po to, aby:** Zachować wysoką jakość moich materiałów i uwzględnić tylko wartościowe fiszki

**Kryteria akceptacji:**
- Propozycje fiszek wyświetlają się jako interaktywna lista poniżej obszaru wprowadzania
- Każda fiszka posiada kontrolki: akceptuj, edytuj, odrzuć
- Możliwość masowej akceptacji wszystkich propozycji jednym kliknięciem
- Zaakceptowane fiszki zostają trwale zapisane po potwierdzeniu
- System pokazuje licznik zaakceptowanych/odrzuconych fiszek

### US-005: Modyfikacja zawartości fiszek
**Jako:** Właściciel kolekcji fiszek
**Chcę:** Mieć możliwość edycji treści każdej mojej fiszki
**Po to, aby:** Poprawiać błędy, aktualizować informacje i personalizować pytania do moich potrzeb

**Kryteria akceptacji:**
- W sekcji "Moja Kolekcja" każda fiszka ma opcję edycji
- Kliknięcie aktywuje formularz z bieżącą treścią przodu i tyłu
- Zmiany zapisują się po zatwierdzeniu z walidacją długości
- System oznacza fiszki modyfikowane jako "edytowane"
- Timestamp ostatniej modyfikacji jest automatycznie aktualizowany

### US-006: Usuwanie niechcianych fiszek
**Jako:** Użytkownik zarządzający swoją kolekcją
**Chcę:** Móc trwale usunąć wybrane fiszki
**Po to, aby:** Utrzymać porządek i pozbyć się nieaktualnych lub niepotrzebnych materiałów

**Kryteria akceptacji:**
- Przycisk usuwania jest dostępny przy każdej fiszce w kolekcji
- System wymaga potwierdzenia przed wykonaniem operacji usunięcia
- Modal potwierdzenia jasno komunikuje nieodwracalność operacji
- Po potwierdzeniu fiszka znika z bazy danych i interfejsu
- Wyświetlane jest powiadomienie o pomyślnym usunięciu

### US-007: Manualne dodawanie fiszek
**Jako:** Użytkownik posiadający własne materiały
**Chcę:** Samodzielnie tworzyć fiszki bez wykorzystania AI
**Po to, aby:** Dodawać specyficzne pytania lub informacje, które nie pochodzą z automatycznie przetwarzanych tekstów

**Kryteria akceptacji:**
- Sekcja "Moja Kolekcja" zawiera wyraźny przycisk "Dodaj fiszkę"
- Formularz kreacji zawiera pola na przód i tył fiszki z podglądem liczby znaków
- Walidacja zapewnia niepuste pola i limit długości (200/500 znaków)
- Nowo utworzona fiszka od razu pojawia się na liście
- System oznacza źródło jako "manualne"

### US-008: Inteligentna sesja nauki
**Jako:** Student chcący efektywnie się uczyć
**Chcę:** Uczestniczyć w sesjach nauki kierowanych algorytmem interwałowych powtórek
**Po to, aby:** Maksymalizować retencję wiedzy poprzez naukę we właściwych momentach czasowych

**Kryteria akceptacji:**
- Dedykowana sekcja "Nauka" przygotowuje sesję z algorytmem spaced repetition
- Interfejs prezentuje pojedynczą fiszkę z przednią stroną na początku
- Interakcja użytkownika odkrywa tylną stronę z odpowiedzią
- System oferuje opcje oceny: łatwe/średnie/trudne
- Algorytm dostosowuje harmonogram kolejnych powtórek na podstawie oceny
- Po ocenie automatycznie wyświetla się kolejna fiszka w sesji

### US-009: Izolacja i prywatność danych
**Jako:** Użytkownik przechowujący prywatne materiały edukacyjne
**Chcę:** Mieć gwarancję że moje dane są dostępne wyłącznie dla mnie
**Po to, aby:** Czuć się bezpiecznie przechowując wrażliwe lub osobiste informacje w systemie

**Kryteria akceptacji:**
- Row Level Security w bazie danych izoluje dane poszczególnych użytkowników
- Brak jakichkolwiek mechanizmów publicznego udostępniania w MVP
- Próba dostępu do cudzych zasobów przez API kończy się błędem autoryzacji
- System weryfikuje właściciela przy każdej operacji CRUD
- Dokumentacja prywatności jasno komunikuje praktyki bezpieczeństwa

## 6. Metryki sukcesu

### 6.1. Jakość generowania AI
- **Wskaźnik akceptacji:** Minimum 70% automatycznie wygenerowanych fiszek zostaje zaakceptowanych przez użytkowników
- **Ratio AI vs Manual:** Co najmniej 80% wszystkich nowych fiszek powstaje z wykorzystaniem funkcji AI
- **Wskaźnik edycji:** Nie więcej niż 40% zaakceptowanych fiszek wymaga modyfikacji przed zapisem

### 6.2. Aktywność użytkowników
- **Retencja D7:** 60% nowych użytkowników wraca do aplikacji w ciągu 7 dni od rejestracji
- **Średnia liczba sesji:** Użytkownik przeprowadza minimum 3 sesje generowania w pierwszym tygodniu
- **Rozmiar kolekcji:** Przeciętny aktywny użytkownik gromadzi co najmniej 50 fiszek w ciągu pierwszego miesiąca

### 6.3. Wydajność techniczna
- **Czas generowania:** 95% requestów do API zwraca wyniki w czasie poniżej 10 sekund
- **Wskaźnik błędów:** Mniej niż 5% prób generowania kończy się błędem
- **Uptime:** Aplikacja dostępna przez minimum 99% czasu w miesiącu

### 6.4. Zaangażowanie edukacyjne (jeśli moduł nauki jest zaimplementowany)
- **Częstotliwość nauki:** 40% użytkowników z fiskami przeprowadza sesję nauki przynajmniej raz w tygodniu
- **Completion rate:** 75% rozpoczętych sesji nauki jest dokończonych
- **Efekt spaced repetition:** Średnia ocena trudności fiszek spada o 20% po trzech powtórkach
