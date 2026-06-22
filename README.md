# Flujo de Alta de Paciente · ACHS — Sitio interactivo (Orquestra)

Recreación del sitio interactivo de documentación de flujo (referencia: `figma-site-local/`, Hospital Padre Hurtado), ahora con la **información de la ficha ACHS** y la **identidad de marca Orquestra**.

- **Marca primaria:** Orquestra (navy `#002A6C` + teal `#59D8C4`).
- **Marca secundaria / acentos:** ACHS (verde `#13C045`, extraído de achs.cl).

## Cómo correr

Doble clic en **`start.command`** (levanta `python3 -m http.server` y abre el navegador), o desde la terminal:

```bash
cd sitio-alta-achs
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

> Debe servirse por HTTP (no abrir `index.html` con `file://`), porque carga `assets/js/data.js` y `assets/js/app.js`.

## Qué incluye (3 tabs — misma estructura que el sitio Figma de referencia)

1. **Diagrama** — diagrama de flujo SVG con los estados E1–E9 posicionados y **flechas etiquetadas** "Acción (Perfil)" entre ellos (camino principal + ramas). Clic en un estado → panel lateral "Detalles del Estado" con **Acciones disponibles** (salientes) y **Cómo llegar a este estado** (entrantes).
2. **Pasos** — resumen de cada paso (Actividad, Trigger, Transición E→E, Datos capturados, Notificaciones) + "Opciones Adicionales". No vuelca toda la ficha: resume, igual que el original.
3. **Notificaciones** — matriz de las 15 notificaciones (ID, Emisor, Actividad, Estado resultante, Destinatario, Descripción, Exclusivo Cluster) con filtro por cluster.

Arriba: **summary bar** (Estados / Perfiles / Notificaciones) y **leyenda de perfiles** con color, como en el original.

## Estructura

```
sitio-alta-achs/
├─ index.html              # shell (header de marca + tabs)
├─ start.command           # lanzador del servidor local
├─ README.md
├─ content/
│  └─ ficha-achs.md        # COPIA CANÓNICA de la ficha (= Ficha ACHS.docx)
└─ assets/
   ├─ css/styles.css       # tokens de color + estilos
   └─ js/
      ├─ data.js           # MODELO de datos (refleja la ficha 1:1)
      └─ app.js            # render + interacciones
```

## Ficha y sitio "pareados" (regla de edición)

- `content/ficha-achs.md` es la **fuente de verdad** del contenido.
- `assets/js/data.js` es su **versión estructurada** (lo que consume el sitio).
- **Al cambiar contenido del flujo** (estados, pasos, perfiles, notificaciones), actualizar **ambos** archivos para que no se desincronicen.
- **Cambios solo visuales** (colores, layout, marca) → `assets/css/styles.css` y/o `assets/js/app.js`.

### Dónde tocar para cambios frecuentes

| Cambio | Archivo |
|---|---|
| Texto / datos de un paso del camino feliz | `data.js` → `mainSteps[]` (y `ficha-achs.md`) |
| Ramas / opciones (traslado, cancelar, limpieza alta…) | `data.js` → `additionalTransitions[]` |
| Descripción, nombre o color de un estado | `data.js` → `states[]` |
| Notificación (destinatario, cluster, código) | `data.js` → `notifications[]` |
| Perfil (nombre, color del dot) | `data.js` → `profiles[]` |
| Posición de nodos / flechas del diagrama | `data.js` → `diagramLayout[]` y `diagramEdges[]` |
| Colores de marca | `styles.css` → `:root` |
| Títulos / cabecera | `index.html` |

## Notas

- El **diagrama** es un SVG con nodos posicionados a mano (`diagramLayout`) y flechas con waypoints explícitos (`diagramEdges`), igual que el sitio Figma de referencia. Para mover un estado, ajustar su `x,y` y las `pts` de las flechas que lo tocan.
- Sitio 100 % estático, sin dependencias ni build.
