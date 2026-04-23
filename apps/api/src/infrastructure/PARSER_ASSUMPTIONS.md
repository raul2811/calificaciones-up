# Avance Parser - Supuestos

1. El bloque de resumen usa `div.contentInstrucciones div.destacado span` con formato `Etiqueta:Valor`.
2. Los datos del estudiante/titulacion usan `p.fltlft.peq` con formato `Etiqueta:Valor`.
3. La tabla de materias es `table#listado`.
4. Los encabezados de la tabla pueden variar en acentos/puntos (`Cod. Asig.`, `Créditos`, `Calificación`), por lo que el parser normaliza texto para mapear columnas.
5. `estado` y `observacion` son opcionales: solo se rellenan si existen columnas equivalentes.
6. Si faltan campos criticos (`nombre`, `carrera`, `plan`, `indice`, `ano`, `sem / ciclo`) el parser falla con error tipado.
7. El parser devuelve HTML sin mutarlo y no depende de JavaScript embebido.
