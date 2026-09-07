# MailBuddy MVP

Prototipo local del flujo definido para revisar Gmail con IA sin enviar correos automaticamente.

## Flujo incluido

- La IA lee hilos nuevos o actualizados.
- Clasifica cada hilo como:
  - `Requiere respuesta mia`
  - `Solo informacion`
  - `Spam / irrelevante`
- Para `Requiere respuesta mia`, crea un borrador, marca el hilo como leido y aplica `AI / Draft Ready`.
- Para `Solo informacion`, genera resumen, marca el hilo como leido y aplica `AI / Summary`.
- Para `Spam / irrelevante`, marca como leido, aplica `AI / Spam` y lo trata como archivado.

## Acciones del MVP

### AI / Draft Ready

- `Enviar`: simula el envio manual y cierra el hilo.
- `No contestar`: descarta el borrador y cierra el hilo.
- `Responder con prompt`: actualiza el borrador segun la guia escrita por la persona.

### AI / Summary

- `Entendido`: cierra el resumen revisado.
- `Contestar`: convierte el hilo en `AI / Draft Ready` y genera borrador.
- `Abrir email`: placeholder para abrir el hilo original en Gmail.

## Siguiente paso tecnico

Sustituir los datos simulados de `app.js` por un conector real:

- Gmail API para leer hilos, modificar labels, marcar como leido y crear drafts.
- Un backend pequeno para clasificacion, logs y llamadas al modelo IA.
- Gmail Add-on o extension para mostrar el panel lateral dentro de Gmail.
