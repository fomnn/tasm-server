# Task Management App

## Todos

- [ ] Task api
- [ ] comment api
- [ ] file api

## BD's Commands 

```shell
pnpx wrangler d1 migrations create task-management-db [name]
```

### initial migration
```shell
pnpx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script \
  --output [path]
```

```shell
pnpx prisma migrate diff --from-local-d1 --to-schema-datamodel ./prisma/schema.prisma --script --output [path]
```

```shell
pnpx wrangler d1 migrations apply task-management-db --local
```

```shell
pnpx prisma generate
```
