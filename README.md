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
   que lee ese JSON y anima: mapa coloreado país por país, barra de
   progreso, contadores y lista lateral — igual a la mecánica del video de
   referencia.
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
  "categories": {
    "clave_a": { "label": "ETIQUETA A", "color": "#2ecc71" },
    "clave_b": { "label": "ETIQUETA B", "color": "#e74c3c" }
  },
  "neutralColor": "#e9e9e9",
  "countries": { "ARG": "clave_a", "BRA": "clave_b" },
  "revealOrder": ["ARG", "BRA"],
  "timing": {
    "fps": 30,
    "introSeconds": 1,
    "perCountrySeconds": 0.6,
    "outroSeconds": 2
  }
}
```

- Los países se identifican por su código **ISO 3166-1 alpha-3** (ARG,
  BRA, USA, ESP, etc.).
- `region` acepta `"world"` o el nombre de un continente/subregión tal como
  aparece en `data/countries.generated.json` (`region` o `subregion`), por
  ejemplo `"South America"`, `"Europe"`, `"Asia"`.
- El orden de `revealOrder` define en qué momento se colorea cada país, la
  barra avanza y aparece en la lista lateral.
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

Esta primera versión prioriza que la lógica funcione (mapa real con
fronteras, barra, contador y lista sincronizados con los datos). Pendiente
para una siguiente etapa, según lo conversado:

- Estilo visual más fiel al video de referencia (ojos animados sobre los
  países, textura de bandera dentro de cada país, tipografía tipo meme).
- Selector de región más flexible (listas de países custom, no solo por
  continente/subregión).
- Export directo a formatos verticales (9:16) para Shorts/Reels.
