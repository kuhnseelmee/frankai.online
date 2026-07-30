# Restore evidence summary

- Native custom-format staging dump restored into disposable database.
- Disposable roles were non-superuser, `NOCREATEDB`, and `NOCREATEROLE`.
- Runtime role had application-table privileges, no schema CREATE, and no
  `schema_migrations` SELECT privilege.
- Temporary standalone candidate started on port 4600.
- Candidate health returned 200; unauthenticated auth/admin boundaries returned
  401; runtime query and privilege-denial checks passed.
- Disposable database and roles were removed after the rehearsal.

Classification: `OPERATIONAL_RESTORE_VERIFIED`.
