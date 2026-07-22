# Multi-tenancy

ITGO usa aislamiento lógico por empresa. El acceso requiere una membresía activa y, para mutaciones privilegiadas, un permiso vigente derivado de roles. Las funciones privilegiadas validan `auth.uid()` y fijan `search_path`.
