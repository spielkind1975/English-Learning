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

## Android-App

Im Ordner `android/` liegt ein Android-Studio-Projekt. Die App zeigt dieselbe Web-App in einem WebView an und nutzt für Sprachausgabe und Spracherkennung die Funktionen von Android (`TextToSpeech` und `SpeechRecognizer`).

1. In Android Studio **File → Open** wählen und den Ordner `android` öffnen (nicht das Hauptverzeichnis).
2. Warten, bis die Gradle-Synchronisierung fertig ist.
3. Handy per USB anschließen (USB-Debugging aktiviert) oder einen Emulator wählen und auf **Run ▶** klicken.

Die Dateien `index.html`, `app.js`, `data.js` und `styles.css` werden bei jedem Build automatisch aus dem Hauptverzeichnis in die App kopiert. Änderungen an der Web-App gelten also für Website und Android-App.

Voraussetzungen auf dem Gerät: Android 8.0 oder neuer, eine Sprachausgabe mit englischer Stimme und eine Spracherkennung (auf den meisten Geräten die Google-App).

## Inhalte erweitern

Alle Lerninhalte stehen in `data.js`. Für ein neues Thema genügt ein weiterer Eintrag in `TOPICS`.
