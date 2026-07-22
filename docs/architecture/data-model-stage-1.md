# Modelo de datos — Etapa 1

La Etapa 1 introduce perfiles vinculados a `auth.users`, empresas multi-tipo, membresías, RBAC, invitaciones, contactos, direcciones, preferencias y auditoría ampliada.

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : posee
  PROFILES ||--o{ COMPANY_MEMBERSHIPS : integra
  COMPANIES ||--o{ COMPANY_MEMBERSHIPS : contiene
  COMPANY_MEMBERSHIPS ||--o{ MEMBERSHIP_ROLES : recibe
  ROLES ||--o{ MEMBERSHIP_ROLES : asigna
  ROLES ||--o{ ROLE_PERMISSIONS : agrupa
  PERMISSIONS ||--o{ ROLE_PERMISSIONS : habilita
  COMPANIES ||--|| COMPANY_SETTINGS : configura
  COMPANIES ||--o{ COMPANY_INVITATIONS : invita
  COMPANIES ||--o{ COMPANY_CONTACTS : registra
  COMPANIES ||--o{ COMPANY_ADDRESSES : ubica
```

La autorización se aplica en PostgreSQL mediante RLS. Los filtros del frontend nunca constituyen una frontera de seguridad.
