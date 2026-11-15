# Business English Coach

Eine Web-App zum Lernen von Business-Englisch, mit Sprachausgabe in korrektem Englisch und Aussprache-Feedback. Sie braucht keine Installation und keinen Server.

## Starten

**Online:** https://spielkind1975.github.io/English-Learning/

Lokal: `index.html` im Browser öffnen, am besten in **Chrome**, **Edge** oder **Safari**, weil Firefox keine Spracherkennung unterstützt. Für das Mikrofon muss die Seite über `https://` oder `localhost` laufen, zum Beispiel:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Funktionen

- **8 Business-Themen**: Meetings, E-Mails, Telefon/Video-Calls, Präsentationen, Verhandlungen, Small Talk, Vorstellungsgespräch, Projekte & Termine
- **Redewendungen** mit deutscher Übersetzung: anhören (normal oder langsam) und nachsprechen
- **Aussprache-Bewertung**: die Spracherkennung vergleicht das Gesagte Wort für Wort mit dem Zielsatz, zeigt eine Punktzahl, markiert nicht erkannte Wörter rot und spielt sie per Klick einzeln vor
- **Aussprache-Training** für typische Schwierigkeiten Deutschsprachiger: th, w/v, stimmhafte Endungen, æ/e, englisches r, „-ed“-Endungen, jeweils mit Minimalpaaren und Übungssatz
- **Vokabel-Lernkarten** mit Wiederholung in wachsenden Abständen (Leitner-System, 1/2/4/8/16 Tage)
- **Quiz** (Bedeutung, Vokabel, Lückentext) und **Hörverständnis-Übungen**
- **Einstellungen**: britischer oder amerikanischer Akzent, Stimme, Sprechtempo
- Der Fortschritt wird lokal im Browser gespeichert

## Inhalte erweitern

Alle Lerninhalte stehen in `data.js`. Für ein neues Thema genügt ein weiterer Eintrag in `TOPICS`.
