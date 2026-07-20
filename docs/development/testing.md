# Estrategia de pruebas

Vitest y Testing Library cubren configuración, errores y UI aislada. Las pruebas de integración ejercitan Route Handlers sin red. Playwright verifica la portada en un navegador real. Ninguna prueba unitaria depende de Supabase remoto. Todo cambio debe conservar lint, typecheck, tests y build en verde.
