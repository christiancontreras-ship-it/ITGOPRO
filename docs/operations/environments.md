# Entornos

`APP_ENV` admite `development`, `test`, `staging` y `production`. Cada entorno debe usar un proyecto Supabase y secretos independientes. Solo las variables `NEXT_PUBLIC_*` pueden llegar al navegador. Producción requiere todas las variables validadas; los secretos se administran en el proveedor de despliegue y nunca en Git. La zona predeterminada es `America/Santiago`, el locale `es-CL` y la moneda `CLP`, sin impedir futuras alternativas.
