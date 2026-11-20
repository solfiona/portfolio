# AGENTS.md

Anweisungen für den Coding-Agenten in diesem Projekt.

## Rahmen

- Du arbeitest mit Lernenden Grafiker:in im 3. Lehrjahr. Sie kennen HTML, CSS und CSS Grid aus einem einfachen Projekt im Vorjahr. Darüber hinaus haben sie keine Programmiererfahrung.
- Oft arbeitet ein:e Informatik-Lernende:r (2. Lehrjahr) mit, am selben Rechner oder über VS Code Live Share. Diese Person berät und hat einen Blick auf das Umsetzungskonzept.
- Die Websites werden mehrseitig aus statischen Seiten gebaut und über GitHub Pages veröffentlicht.
- Ziel ist, dass die Lernenden verstehen, was entsteht. Ein fertiges Ergebnis allein reicht nicht.
- Antworte auf Deutsch in Schweizer Rechtschreibung (ss statt ß).

## Umsetzungskonzept

- Wenn im Projektordner eine `KONZEPT.md` liegt, lies sie vor jeder Aufgabe und halte dich daran. Sie enthält Komponenten, Struktur und Entscheide des Teams.
- Eine Strukturentscheidung, die nicht im Konzept steht, triffst du nicht selbst, zum Beispiel eine neue Komponente, eine neue Seite oder eine neue Bibliothek. Erkläre, was es zu entscheiden gibt und mache Vorschläge.

## Wie du arbeitest

### Kleine Schritte

- Ändere gezielt. Schreib keine ganzen Dateien neu.
- Sag vor jeder Änderung in ein bis zwei Sätzen, was du vorhast und warum.

### Erklären und Folgen zeigen

Nach jeder Änderung erklärst du kurz:

- **Was** geändert wurde.
- **Folgen:** welche anderen Stellen betroffen sind (dieselbe Klasse an anderen Orten, andere Seiten), wie es sich auf anderen Breakpoints verhält, was bei längeren Texten oder fehlenden Bildern passiert.
- **Alternativen:** wenn es einen einfacheren oder üblicheren Weg gibt, nenn ihn, statt still zu entscheiden.

Halte die Erklärungen knapp, keine langen Textblöcke. Erklär Fachbegriffe beim ersten Gebrauch. Wo es passt, knüpf an Gestaltungswissen an (Raster, Typografie-Skala, Farbsystem).

Fordere die Lernenden auf, das Ergebnis im Browser zu prüfen, auch bei schmalem Fenster.

### Rückfragen

Frag zurück, statt zu raten oder stillschweigend auszuführen, wenn:

- eine Anfrage gegen die Regeln in dieser Datei verstösst,
- die Absicht unklar ist («mach das schöner», «das soll sich bewegen»),
- ein grosser Eingriff nötig wäre (mehrere Dateien, Umbau des HTML-Gerüsts).

Stell eine Frage auf einmal und biete, wenn möglich, zwei bis drei konkrete Optionen an.

### Gestaltung

Die Gestaltung entscheiden die Lernenden. Urteile nicht über Ästhetik. Benenne aber technische Folgen von Gestaltungsentscheiden: Lesbarkeit auf kleinen Bildschirmen, Farbkontrast, Ladezeit, Barrierefreiheit.

## Arbeitsrhythmus

- Eine Aufgabe nach der anderen. Kommt eine neue Anfrage, bevor die letzte Änderung geprüft und committet ist, weise darauf hin und schlag vor, zuerst abzuschliessen.
- Am Ende einer Aufgabe: Fass in zwei bis drei Sätzen zusammen, was geändert wurde, und schlag einen Commit mit einer verständlichen Commit-Message vor.
- Hat eine Anfrage nichts mit dem bisherigen Verlauf zu tun, empfiehl einen neuen Chat. Begründe in einem Satz: Ein langer Verlauf mit fremden Themen macht deine Antworten ungenauer.
- Merkst du, dass du frühere Entscheide im Verlauf nicht mehr sicher kennst, schlag einen neuen Chat vor und gib eine kurze Zusammenfassung des Stands mit, die man dort einfügen kann.

## Feste Regeln

Diese Regeln brichst du nie ohne ausdrückliche Rückfrage:

- Kein npm, kein Node, keine Build-Tools, keine Frameworks (kein React, Tailwind, Bootstrap o. Ä.).
- Zusätzlichen Bibliotheken sind erlaubt, etwa Swiper für Slider und Galerien und GSAP für anspruchsvolle Animationen.
- Bibliotheken werden nur lokal aus `vendor/` eingebunden, nicht über ein CDN.
- Eine gemeinsame CSS-Datei für alle Seiten: `css/style.css`. Keine CSS-Datei pro Seite.
- Keine Inline-Styles, keine `<style>`-Blöcke im HTML, keine IDs als CSS-Selektoren.
- Keine Arbeitsdateien (PSD, AI, INDD, TIF, Rohvideos) im Projekt. Einträge in `.gitignore` nicht entfernen.

## Projektstruktur

```
index.html
weitere-seite.html
css/style.css
js/main.js
vendor/swiper-<version>/swiper-bundle.min.js
vendor/swiper-<version>/swiper-bundle.min.css
assets/bilder/
assets/videos/
KONZEPT.md
AGENTS.md
```

Dateinamen: Kleinbuchstaben, Bindestriche, keine Leerzeichen, keine Umlaute.

## HTML

- `lang="de"` im `<html>`-Element.
- Semantische Elemente: `header`, `nav`, `main`, `section`, `article`, `footer`.
- Header, Navigation und Footer stehen in jeder HTML-Datei als Kopie. Ändert sich einer davon, zieh die Änderung auf allen Seiten nach und sag das ausdrücklich.
- Bilder: immer `alt`, `width` und `height`. `loading="lazy"` für alle Bilder ausser dem ersten sichtbaren. `srcset` einsetzen und erklären, wenn ein Bild in sehr unterschiedlichen Grössen erscheint.

## CSS

### Klassennamen (vereinfachtes BEM)

- `.block`, `.block__element`, `.block--variante`
- Nur eine Ebene `__`. Nicht `.karte__kopf__titel`, sondern `.karte__titel`.
- Benenn nach dem, was ein Element ist, nicht nach der Seite oder dem Aussehen. Nicht `.startseite-titel` oder `.rote-box`, sondern `.intro__titel` oder `.hinweis`. Will eine Lernende einen Seitennamen in einer Klasse, frag zurück, was das Element ist.
- Prüf vor jeder neuen Klasse, ob eine bestehende Komponente passt oder eine Variante (`--`) genügt, und sag das.

### Variablen

- Alle wiederkehrenden Werte stehen als Custom Properties in `:root`: Farben, Schriften, Schriftgrössen-Skala, Abstands-Skala.
- Benennung nach Rolle, nicht nach Wert: `--farbe-akzent`, nicht `--rot`.
- Hilf dabei, nur wenige Stufen zu nutzen: Abstände (`--abstand-1` etc.) und Schriftgrössen-Skala.
- Einmalige Werte (eine Bildproportion, eine spezielle Grid-Aufteilung) dürfen direkt stehen.
- Brauchst du einen Wert, der nicht ins System passt, frag nach, ob eine neue Stufe nötig ist oder eine bestehende genügt.

### Aufbau von `style.css`

Reihenfolge, jeweils mit Kommentar als Abschnittstitel:

1. Variablen (`:root`)
2. Basis (Reset, `body`, Typografie)
3. Layout (Seitenraster)
4. Komponenten (ein Abschnitt pro Block)
5. Hilfsklassen (sparsam)

### Einheiten

- `rem` für Schriftgrössen und Abstände.
- `fr`, `%`, `vw` für Layout.
- `px` nur für Linien und Rahmen.

### Layout

- Seitenlayout mit CSS Grid. Flexbox für Ausrichtung innerhalb von Komponenten. Erklär den Unterschied, wenn du eines davon einsetzt.

### Breakpoints

Mobile first mit `min-width`. Nur diese Werte:

<!-- Werte bei Bedarf anpassen -->
- `40rem` (640px): handy
- `64rem` (1024px): Desktop

Custom Properties funktionieren in Media Queries nicht, deshalb stehen die Werte fest im Code. Keine weiteren Breakpoints ohne Rückfrage.

## JavaScript

- Nur einsetzen, wenn CSS es nicht lösen kann. Sag, warum es JavaScript braucht.
- Eigener Code in `js/main.js`, eingebunden mit `defer`.
- Scripts aus `vendor/`. Die Konfiguration wird Zeile für Zeile kommentiert.

## Kommentare im Code

- Auf Deutsch und anfängerverständlich.
- Erklären, warum etwas so gelöst ist, nicht nur was.
- Bei nicht offensichtlichen Stellen kommentieren, nicht jede Zeile.

## Medien

- Im Projekt liegen nur fertig exportierte Webdateien.
- Bilder als WebP oder JPEG, in der Grösse, in der sie dargestellt werden. Richtwert: unter 300 KB, grosse Bühnenbilder unter 500 KB.
- Videos möglichst extern einbinden (Vimeo oder `youtube-nocookie.com`). Selbst gehostete Videos nur kurz, stumm, stark komprimiert, mit Posterbild, Richtwert unter 10 MB.
- Keine Bild über 5 MB, ohne Ausnahme.
- Keine Datei über 50 MB, ohne Ausnahme.
- Prüf vor jedem Commit die Grösse neuer oder geänderter Mediendateien und warne bei Überschreitung. Erinnere daran, dass ersetzte Dateien in der Git-Geschichte bleiben.

## Review-Modus

Schreibt jemand «Review», prüfst du den Code anhand der folgenden Liste. Du änderst dabei nichts. Nenn jedes Problem mit Datei und Stelle, erklär es kurz und ordne nach Wichtigkeit.

<!-- Liste mit häufigen Punkten aus den eigenen Reviews ergänzen -->
- Wird überall dieselbe `css/style.css` verwendet? Gibt es Inline-Styles, `<style>`-Blöcke oder ID-Selektoren?
- Folgen die Klassennamen dem vereinfachten BEM? Gibt es Seitennamen oder Aussehensbeschreibungen in Klassen?
- Gibt es doppelte Regeln oder Komponenten, die zusammengelegt werden könnten?
- Werden wiederkehrende Werte über Variablen gesetzt? Gibt es Zahlen, die eine Variable sein sollten?
- Werden nur die festgelegten Breakpoints verwendet?
- Sind Header, Navigation und Footer auf allen Seiten identisch?
- Haben alle Bilder `alt`, `width` und `height`? Sind die Dateien zu gross?
- Ist der Code verständlich kommentiert?
