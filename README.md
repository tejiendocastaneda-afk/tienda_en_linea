# Tejidos Castañeda — Tienda Online

## Cómo usar

1. Abre `index.html` directamente en el navegador — funciona sin servidor.
2. Para GitHub Pages: sube todos los archivos a tu repositorio y activa Pages apuntando a la raíz.

## Estructura de archivos

```
/
├── index.html          ← Toda la estructura HTML
├── style.css           ← Estilos (paleta, responsive, dark mode)
├── script.js           ← Lógica SPA, carrito, modales
└── fotos/
    ├── ruanas/
    │   ├── Ruana-A.jpeg
    │   ├── Ruana-B.jpeg
    │   ├── Ruana-C.jpeg
    │   └── Ruana-D.jpeg
    ├── chompas/
    │   ├── Chompa-A.jpeg
    │   ├── Chompa-B.jpeg
    │   └── Chompa-C.jpeg
    ├── yetis/
    │   ├── Yeti-A.jpeg
    │   ├── Yeti-B.jpeg
    │   ├── Yeti-C.jpeg
    │   ├── Yeti-D.jpeg
    │   └── Yeti-E.jpeg
    ├── Camisetas/
    │   ├── Camiseta-A.jpeg
    │   ├── Camiseta-B.jpeg
    │   ├── Camiseta-C.jpeg
    │   ├── Camiseta-D.jpeg
    │   └── Camiseta-E.jpeg
    ├── colecciones/
    │   └── Coleccion-A.jpeg
    └── Busos/
        ├── Buso-A.jpeg
        ├── Buso-B.jpeg
        ├── Buso-C.jpeg
        ├── Buso-D.jpeg
        └── Buso-E.jpeg
```

## Notas importantes

- **Fotos**: Agrega tus fotos reales en las carpetas indicadas con los nombres exactos.
  Si una foto no existe, el sitio usa una imagen de Unsplash como fallback automáticamente.
- **WhatsApp**: El número configurado es `+57 310 616 6431` (wa.me/573106166431).
- **Modo oscuro**: Se guarda en localStorage del navegador.
- **Catálogo**: Al hacer clic en los thumbnails de un producto, cambia la foto principal.

## Checklist de funcionalidades ✅

- [x] SPA con 6 páginas (inicio, catálogo, recomendados, nosotros, info, contacto)
- [x] Header fijo que se oculta al bajar y reaparece al subir
- [x] Top bar con marquee animado
- [x] Menú hamburguesa en móvil (dropdown desde arriba-derecha)
- [x] Barra de búsqueda que filtra el catálogo
- [x] Modo oscuro con localStorage
- [x] Carrito lateral con cantidades, eliminar y barra de progreso
- [x] Modal de pedido antes de ir a WhatsApp (con nombre del cliente)
- [x] Modal de vista rápida por producto
- [x] Thumbnails de variantes que cambian la foto principal
- [x] Pestañas Unitario/Mayorista con precio y ahorro
- [x] Filtros por categoría y ordenar en el catálogo
- [x] Estadísticas animadas desde 0 en la página Nosotros
- [x] Dropdown de ciudades con tiempo de entrega estimado
- [x] Estado en tiempo real (abierto/cerrado) según hora Colombia
- [x] Botón flotante WhatsApp con tooltip
- [x] Botón volver arriba (aparece al bajar 300px)
- [x] Toast al agregar productos al carrito
- [x] Footer completo con redes sociales
- [x] Responsive completo (mobile, tablet, desktop)
