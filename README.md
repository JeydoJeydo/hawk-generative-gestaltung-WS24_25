![banner](https://github.com/JeydoJeydo/hawk-generative-gestaltung-WS24_25/blob/main/assets/banner.png?raw=true)

# Generative Gestaltung - Semesterprojekt WiSe24/25 - Silas Hering

## Running

### Install dependencies

```bash
npm i
```

### Run project

```bash
npm run dev
```

Das Project über https und Netzwek laufen lassen. (Um es auf einem Handy zu sehen z.B.)

```bash
npm run host
```

### Converting to pdf

```bash
pandoc README.md -o README.pdf --from=gfm -V geometry:a4paper -V geometry:top=8mm -V geometry:bottom=8mm -V geometry:left=8mm -V geometry:right=8mm -V fontsize=12pt -V mainfont="DejaVu Sans" -V sansfont="DejaVu Sans" --pdf-engine=xelatex
```

## Aufgabestellung

_Ihr sucht Eur ein freies Thema, welches dann unter den
Euch bekannten Funktionen von p5.js umgesetzt wird. 
Hier sollte vor allem darauf geachtet werden, 
dass der Aspekt des Generativen im Projekt sichtbar wird!_
[Notion - Semesterprojekt](https://mherzog.notion.site/Semesterprojekt-18aab8cfc223800fa077e251ba04a625)

## Über das Projekt

Das Generative des Projektes lässt sich in folgenden Aspekten wiederfinden:

1. Veränderung der Umgebungslautstärke
2. Deviceausrichtung
3. Displaygröße
4. Interaktion mit dem Display
5. Veränderung des Standorts
6. Neu-laden

Aufgrund dieser veränderbaren Werte wird ein Gradient erzeugt, der abhängig von 
Umgebungslautstärke oder Interaktion mit dem Display auf Spheren oder Cylindern dargestellt wird.    
Der Gradient wird vom jeweiligen Standort beeinflusst, sodass die Gradienten mehrerer Devices,
die sich am selben Standort befinden, die selbe Farbgebung aufweisen. 
Ca. alle 10m^2 ändert sich die Farbgebung.    
Die Deviceausrichtung beeinflusst eine perspektivische Verschiebung der dargestellten Objekte.

## Vorgehensweise

Die einzelnen Arbeitsschritte können in den Commits des [Github Projekts](https://github.com/JeydoJeydo/hawk-generative-gestaltung-WS24_25/commits/main/) nachvollzogen werden.

Ich begann die Aufgabe mit der Inspirationsfindung.  
