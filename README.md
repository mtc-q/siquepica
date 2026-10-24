# Siquepica® · Sitio web

Sitio oficial de **Siquepica | Dulces enchilados** (Saltillo · Monterrey · envíos nacionales).
Es un sitio estático (HTML + CSS + JavaScript), sin dependencias ni compilación: se sube tal cual a GitHub Pages.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `siquepica`).
2. Sube **el contenido de esta carpeta** (que `index.html` quede en la raíz del repositorio).
   - Desde la web: *Add file → Upload files* y arrastra todo.
3. Ve a **Settings → Pages**.
4. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guarda.
5. En 1–2 minutos el sitio queda en `https://TU-USUARIO.github.io/siquepica/`.

¿Dominio propio (ej. `siquepica.mx`)? En *Settings → Pages → Custom domain* escríbelo y sigue las instrucciones de DNS.

## Estructura

```
index.html          Página con las 6 pestañas (Inicio, Productos, Cómo pedir, Encuéntranos, Nosotros, Contacto)
css/styles.css      Estilos y animaciones (colores del logo en :root)
js/datos.js         ← AQUÍ editas productos, WhatsApp, Instagram y equipo
js/main.js          Pestañas, carrito de pedido, formularios a WhatsApp
img/                Logo, íconos e ilustraciones de producto
fonts/              Tipografías Bungee y Figtree (licencia OFL, incluidas en el sitio)
```

## Cambios comunes

**Poner fotos reales de los productos**
1. Guarda la foto en `img/productos/` (cuadrada, ~800×800, .jpg o .webp).
2. En `js/datos.js`, en el producto que corresponda, escribe la ruta en `foto`:
   `foto: "img/productos/cherry-bombs.jpg"`
   Si la foto falla, el sitio muestra la ilustración automáticamente.

**Agregar a los dueños / equipo (sección "Detrás de Siquepica")**
1. Guarda cada foto en `img/equipo/`.
2. En `js/datos.js`, llena la lista `equipo`:
   ```js
   equipo: [
     { nombre: "Nombre Apellido", rol: "Fundadora", texto: "Una frase corta.", foto: "img/equipo/nombre.jpg" }
   ]
   ```
   La sección aparece sola en la pestaña *Nosotros* cuando la lista tiene al menos una persona.

**Agregar o quitar productos:** copia o borra un bloque `{ ... }` dentro de `productos` en `js/datos.js`.
Categorías válidas para los filtros: `bolsitas`, `charolas`, `fruta`.

**Link directo de Rappi:** cambia `rappiUrl` en `js/datos.js` por el enlace de la tienda en Rappi.

**Cambiar WhatsApp:** `whatsapp` (sin + ni espacios) y `whatsappVisible`.

## Cómo funciona el pedido

El visitante agrega productos, elige ciudad y forma de entrega, y el botón abre WhatsApp con el pedido ya escrito.
No hay precios en la página a propósito: se confirman por WhatsApp/DM (apartado con 50% de anticipo).
