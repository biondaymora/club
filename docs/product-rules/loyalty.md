# Reglas de fidelización

Este documento es la fuente de producto de las reglas. Cualquier cambio debe incluir aprobación de negocio, prueba automatizada y, si altera una decisión duradera, un ADR.

- Los puntos, cashback, niveles, vencimientos y redenciones se calculan en servidor.
- Los valores monetarios se almacenan como enteros en unidades mínimas COP; nunca como `float`.
- Una devolución genera una reversión trazable y no edita la concesión original.
- El cashback solo se considera disponible después de que el pedido alcance el estado comercial definido por negocio.
- Los ajustes manuales requieren razón, autor y registro de auditoría.

