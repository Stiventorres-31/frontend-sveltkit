## Modificaciones
- Realice la importacion de bootstrap desde app.html para que sea importado en todo el proyecto
- Se crear el archivo api.ts con helpers genericos y funciones especificas
- Se elimina onMount/axio en las paginas; se usa `load` de SvelteKit con `fetch`
- El endpoind del api viene desde el env y no crudo en el codigo
- Se refactoriza `voucher/+page.svelte` para reutilizar `fetchTransaction` en load