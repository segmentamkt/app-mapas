# app-mapas

Generador de videos tipo "mapa animado país por país" (el estilo de los
videos de YouTube donde se va revelando qué países están en la categoría A
o B, con barra de progreso, contadores y lista lateral).

## Cómo funciona

1. **Datos**: cada video se describe en un archivo JSON en `data/videos/`
   (ver `data/videos/demo-south-america.json`). Ese JSON define el título,
   la región del mapa, las categorías (nombre + color) y qué país va en
   cada categoría, además del orden de revelado.
2. **Render**: `src/` es un proyecto de [Remotion](https://www.remotion.dev)
   que lee ese JSON y anima: cámara que viaja y hace zoom país por país,
   cada país se rellena con su bandera real al revelarse, ojos animados
   (calmos o enojados según la categoría) en el país que está "aterrizando"
   en ese momento, barra de progreso, contadores y lista lateral — igual a
   la mecánica del video de referencia.
3. **Salida**: `npm run render -- data/videos/<archivo>.json` produce un
   `.mp4` en `out/`.

## Flujo de trabajo (generar un video nuevo por prompt)

Le describís a Claude el tema y la clasificación de países en lenguaje
natural (ej: "hacé un video de qué países de Europa tienen el servicio X
disponible: Francia, Alemania e Italia sí, España y Portugal no"). Claude
crea/edita un archivo en `data/videos/` con ese esquema y corre el render.
No hace falta tocar código para un video nuevo — solo el JSON.

### Esquema de `data/videos/*.json`

```json
{
  "id": "nombre-del-video",
  "title": "Texto que aparece arriba del video",
  "region": "world | South America | Europe | ...",
  "subtitle": "Línea chica opcional debajo del título",
  "cameraMode": "zoom",
  "showEyes": true,
  "categories": {
    "clave_a": { "label": "ETIQUETA A", "color": "#2ecc71", "mood": "calm" },
    "clave_b": { "label": "ETIQUETA B", "color": "#e74c3c", "mood": "angry" }
  },
  "neutralColor": "#e9e9e9",
  "countries": { "ARG": "clave_a", "BRA": "clave_b" },
  "revealOrder": ["ARG", "BRA"],
  "scenes": { "BRA": { "seconds": 3, "zoom": 1.6 } },
  "timing": {
    "fps": 30,
    "introSeconds": 1,
    "perCountrySeconds": 1.8,
    "outroSeconds": 2
  }
}
```

- Los países se identifican por su código **ISO 3166-1 alpha-3** (ARG,
  BRA, USA, ESP, etc.).
- `region` acepta `"world"` o el nombre de un continente/subregión tal como
  aparece en `data/countries.generated.json` (`region` o `subregion`), por
  ejemplo `"South America"`, `"Europe"`, `"Asia"`.
- El orden de `revealOrder` define en qué momento la cámara viaja hacia ese
  país, se colorea con su bandera, la barra avanza y aparece en la lista
  lateral.
- Se soportan **2 o más categorías** (por ejemplo LIBRE / RESTRINGIDO /
  PROHIBIDO): la barra superior se segmenta con un color por categoría y los
  contadores se muestran como chips.
- `categories.<clave>.mood` controla las cejas/ojos del país mientras está
  enfocado: `"angry"` (cejas en V, para "prohibido"/"alto riesgo"),
  `"worried"` (cejas levantadas) o `"calm"` (por defecto).
- `cameraMode`: `"zoom"` (por defecto) viaja y hace zoom país por país;
  `"static"` mantiene una vista fija de toda la región.
- `showEyes`: `true` (por defecto) dibuja los ojos animados sobre el país
  enfocado; `false` los apaga.
- `scenes.<CCA3>`: overrides por país — `seconds` (duración de esa escena) y
  `zoom` (1 = encuadre normal, 2 = el doble de cerca).
- El `title` acepta `\n` para forzar saltos de línea.
- `timing.perCountrySeconds` es el tiempo total por país; el motor reparte
  internamente ~45% en el viaje de cámara (ojos neutros, sin colorear) y el
  resto en el "aterrizaje" (bandera + ojos con el mood de la categoría).
  Valores entre 1.5 y 2.5s se leen bien; menos de 1s se siente apurado.
- Se soportan más de 2 categorías, pero la barra tipo "VS" con etiquetas a
  los costados solo se dibuja cuando hay exactamente 2.

## Comandos

```bash
npm install                 # instala dependencias (ya hecho)
npm run build:countries     # regenera data/countries.generated.json
npm run studio               # abre Remotion Studio (preview interactivo en el navegador)
npm run render -- data/videos/demo-south-america.json   # exporta a out/demo-south-america.mp4
```

## Estado actual / próximos pasos

Ya implementado: mapa con fronteras reales, cámara animada que viaja y
hace zoom país por país, relleno con la bandera real de cada país, ojos
animados con mood por categoría, barra/contador/lista sincronizados, y
export a MP4.

Pendiente para una siguiente etapa:

- Selector de región más flexible (listas de países custom, no solo por
  continente/subregión).
- Export directo a formatos verticales (9:16) para Shorts/Reels.
- Tipografía/branding más cercano al estilo meme del video de referencia.

## Nota sobre veracidad de los datos

Esta herramienta solo automatiza la puesta en escena (mapa, cámara, barra,
lista). La clasificación de qué país va en cada categoría la aporta quien
pide el video — conviene verificar que sea información real antes de
publicarlo, sobre todo en temas sensibles (prohibiciones, censura, leyes),
para no difundir datos falsos.
