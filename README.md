![banner](https://github.com/JeydoJeydo/hawk-generative-gestaltung-WS24_25/blob/main/assets/banner.png?raw=true)

# Generative Gestaltung - Semesterprojekt WiSe 24/25 - Silas Hering

## Installation und Ausführung

### Abhängigkeiten installieren

```bash
npm i
```

### Projekt ausführen

```bash
npm run dev
```

Das Projekt über HTTPS und Netzwerk laufen lassen (z. B. um es auf einem Handy zu sehen):

```bash
npm run host
```

### In ein PDF konvertieren

```bash
pandoc README.md -o README.pdf --from=gfm -V geometry:a4paper -V geometry:top=8mm -V geometry:bottom=8mm -V geometry:left=8mm -V geometry:right=8mm -V fontsize=12pt -V mainfont="DejaVu Sans" -V sansfont="DejaVu Sans" --pdf-engine=xelatex
```

## Aufgabestellung

_Ihr sucht euch ein freies Thema, das dann mit den euch bekannten Funktionen von p5.js umgesetzt wird. 
Hierbei sollte vor allem darauf geachtet werden, dass der Aspekt des Generativen im Projekt sichtbar wird!_
[Quelle: Notion - Semesterprojekt](https://mherzog.notion.site/Semesterprojekt-18aab8cfc223800fa077e251ba04a625)

## Über das Projekt

Die generativen Aspekte des Projekts lassen sich in folgenden Punkten wiederfinden:

1. Veränderung der Umgebungslautstärke
2. Geräteausrichtung
3. Displaygröße
4. Interaktion mit dem Display
5. Veränderung des Standorts
6. Neuladen

Aufgrund dieser veränderbaren Werte wird ein Gradient erzeugt, der abhängig von der 
Umgebungslautstärke oder der Interaktion mit dem Display auf Sphären oder Zylindern dargestellt wird.    
Der Gradient wird vom jeweiligen Standort beeinflusst, sodass die Gradienten mehrerer Geräte, 
die sich am selben Standort befinden, dieselbe Farbgebung aufweisen. 
Etwa alle 10 m² ändert sich die Farbgebung.    
Die Geräteausrichtung beeinflusst eine perspektivische Verschiebung der dargestellten Objekte.

## Vorgehensweise

>Die einzelnen Arbeitsschritte können in den Commits des [GitHub-Projekts](https://github.com/JeydoJeydo/hawk-generative-gestaltung-WS24_25/commits/main/) nachvollzogen werden.

Ich begann die Aufgabe mit der Inspirationsfindung und dem Schreiben eines [Konzepts](https://github.com/JeydoJeydo/hawk-generative-gestaltung-WS24_25/blob/main/Generative%20Gestaltung%20-%20Semesteraufgabe%20-%20Konzept%20-%20Silas%20Hering.pdf).    
Im nächsten Schritt beschäftigte ich mich damit, eine [Klasse mit dem Namen `Data`](https://github.com/JeydoJeydo/hawk-generative-gestaltung-WS24_25/blob/7dbcf44ebc2786ea90386ba9982de82150b81f13/sketch.js#L6) zu programmieren. 
Mithilfe dieser Klasse können alle Daten, die für das generative Projekt benötigt werden, initialisiert, aktualisiert und abgerufen werden. 
Bei der Initialisierung werden z. B. Eventlistener für die Geräteposition oder den Audio-Input erstellt. 
Über eine `refresh()`-Funktion können alle Daten aktualisiert werden.    
Ebenfalls gibt es eine [`Blur`-Klasse](https://github.com/JeydoJeydo/hawk-generative-gestaltung-WS24_25/blob/7dbcf44ebc2786ea90386ba9982de82150b81f13/sketch.js#L178), die für die 
verschiedenen unscharfen Bereiche zuständig ist, die über den Canvas wandern. 
In ihr können Position, Intensität und die Größe der einzelnen Bereiche bestimmt werden.    

Ein großer Teil der Zeit floss in die Überlegung, wie man am besten Gradienten auf den Elementen darstellen kann. 
Schließlich fand ich eine gute Möglichkeit für die Umsetzung: Zunächst wird ein Array aus Farben erstellt (`gradientColorArrayGenerator()`), 
dessen Auswahl und Länge an verschiedene Bedingungen geknüpft sind, z. B. den Standort des Geräts. 
Anschließend wird der Gradient an die Funktion `createGradientTexture()` übergeben, 
die aus dem Gradient eine Textur erstellt, die auf einem 3D-Mesh gerendert wird.    

Gegen Ende der Projektumsetzung ging es mir maßgeblich darum, den Code möglichst lesbar zu schreiben und zu 
kommentieren. Auch war es mir wichtig, fallback variabeln so zu setzten, sodass teile der dynamischen Daten fehlen können, 
wie z.B. der Standort, und trotzdem ein funktionierendes Bild dargestellt wird.    

Mit mehr Zeit für die Umsetzung des Projekts hätte ich mich gerne tiefer mit der Erstellung von Gradienten beschäftigt. 
Besonders die Entwicklung eines Gradienten, der nicht nur aus vielen verschiedenfarbigen Linien besteht, 
sondern aus einzelnen Pixeln, die ihre Position untereinander "verstehen", wäre spannend gewesen.    
Grundsätzlich bin ich mit dem finalen Ergebnis aber zufrieden.
