# Shipments XML

Genera los XML de shipments que se suben a la carpeta de la interface, a partir de un Excel con `SKU` y `CANTIDAD`.

Reemplaza el llenado manual del XML: el usuario carga el Excel, elige un customer
de una lista predefinida (47 tiendas) y descarga el XML listo para subir, con
número de pedido único generado por un servicio en Supabase (independiente de
los otros dos sistemas que también generan shipments).


## Cómo correr

```bash
npm install
cp .env.example .env   # completa con la URL y anon key de Supabase
npm run dev
```

## Regenerar `customers.json`

Los datos de los 47 customers se extraen de XML de ejemplo, no se editan a mano
uno por uno.

1. Coloca los XML de ejemplo en `samples/` (no se sube al repo: trae direcciones
   y nombres reales). `src/data/customers.json` sí se sube, porque la app lo
   necesita para correr.
2. Corre:

```bash
node scripts/extract.mjs
```

3. Revisa las advertencias que imprime la consola (campos vacíos, CP inválido,
   `Category2` faltante) y corrige `src/data/customers.json` a mano si hace falta.
