# ADR 0001: Ledger inmutable para puntos y cashback

- **Estado:** Aceptado
- **Fecha:** 2026-10-03

## Contexto

Los saldos pueden cambiar por compras, devoluciones, vencimientos, redenciones y ajustes operativos. Un único campo de saldo no permite reconciliación ni auditoría.

## Decisión

Cada movimiento se guarda como una entrada append-only con importe con signo, fuente externa, clave de idempotencia y metadatos. Los saldos se calculan desde el ledger o una proyección controlada.

## Consecuencias

Se obtiene trazabilidad y reversión segura. Se requiere indexación, proyecciones y pruebas de conciliación.

