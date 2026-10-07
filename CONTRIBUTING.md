# Contribuir

## Ramas

- `main`: producción; protegida y sin pushes directos.
- `development`: integración cuando se requiera una rama compartida.
- `feature/<tema>` y `fix/<tema>`: trabajo de corta duración.

Usa Conventional Commits y abre un pull request pequeño. Toda regla de fidelización necesita pruebas; toda modificación de esquema necesita una migración nueva e inmutable en `supabase/migrations`.

## Migraciones

No edites una migración que ya se haya aplicado fuera de local. Crea otra migración, incluye una ruta de rollback o corrección en el PR y prueba la actualización sobre una copia de datos de prueba.

## Datos y secretos

No subas archivos `.env`, cargas de webhooks reales ni información personal. Usa datos sintéticos en pruebas y los secretos del entorno correspondiente.

