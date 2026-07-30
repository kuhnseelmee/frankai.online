# Database restore rehearsal

The staging database uses a native PostgreSQL dump. Restore work is performed
against a pre-created temporary database with an administrative role; the
application role is never granted `SUPERUSER`, `CREATEDB`, or `CREATEROLE`.

The operational rehearsal must capture both:

1. schema/data dump and checksum; and
2. role/grant definitions, recreated deliberately in the isolated restore.

The runtime role must be able to use application tables but must be denied
`schema_migrations`, schema `CREATE`, database `CREATE`, and migration DDL.
The migration role owns the schema and is the only role used for migrations.

The dedicated staging database applies 001–005. A disposable restore recreated
non-privileged roles, started a standalone candidate, passed health and auth
boundary checks, and passed runtime privilege-denial checks. The evidence is
classified `OPERATIONAL_RESTORE_VERIFIED` for staging.

Restore evidence must contain the dump checksum, PostgreSQL version, migration
IDs, row/table/index/constraint counts, privilege-denial checks, smoke-test
result, cleanup result, and the protected backup path. It must not contain
passwords, connection strings, or token material.
