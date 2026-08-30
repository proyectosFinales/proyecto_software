# Reporte de pruebas — implementación correo opcional

**Fecha:** 2026-08-29
**Archivo de pruebas:** `test/validarEntradas.test.js`
**Config utilizada:** `jest.config.js` (corre tests desde `test/` sin afectar el build de CRA)

## Objetivo

Validar los cambios hechos en `src/controller/validarEntradas.jsx` para el registro
de usuarios con correo opcional:
- `validarCorreoPersonal(correo)` — regex para correos personales (gmail, yahoo, hotmail, outlook).
- `validarCorreoOptExistente(correoOpt, id)` — unicidad del correo opcional contra
  las columnas `correo` y `correo_opt` de `Usuario`.

## Resultado

```
Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Time:        ~9 s
```

## Casos cubiertos

### `validarCorreoPersonal()`
| Caso | Entrada | Esperado | Resultado |
|------|---------|----------|-----------|
| Acepta gmail | `juan@gmail.com` | true | PASS |
| Acepta yahoo (.com/.es) | `juan@yahoo.com`, `juan@yahoo.es` | true | PASS |
| Acepta hotmail (.com/.es) | `juan@hotmail.com`, `juan@hotmail.es` | true | PASS |
| Acepta outlook | `juan@outlook.com` | true | PASS |
| Rechaza institucional | `juan@estudiantec.cr`, `juan@itcr.ac.cr` | false | PASS |
| Rechaza otro dominio | `juan@empresa.com` | false | PASS |
| Rechaza formato inválido | `correo-malo`, `a@b@c.com` | false | PASS |

### `validarCorreoOptExistente()`
| Caso | Mock Supabase | Esperado | Resultado |
|------|---------------|----------|-----------|
| Vacío → válido | (no consulta) | true | PASS |
| Sin coincidencias | `data: []` | true | PASS |
| Existe en otro usuario | `data: [{id:"otro"}]` | false | PASS |
| Misma edición (mismo id) | `data: [{id:"user-1"}]` | true | PASS |
| Error de consulta | `error` presente | true (deja pasar) | PASS |

## Notas

- El cliente de Supabase se mockea en el propio test (`jest.mock("../src/model/supabase")`),
  por lo que **no se golpea la BD real**.
- Se eliminó `test/App.test.js` (stub de CRA que buscaba "learn react"; no aplica al
  proyecto y habría fallado). Se conservó `test/setupTests.js` (config estándar jest-dom).
- Para ejecutar de nuevo: `npx jest --config jest.config.js`
