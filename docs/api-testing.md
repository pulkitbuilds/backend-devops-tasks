# Testing the API with curl

```bash
# No-database signup/login
curl -X POST localhost:3000/api/nodb/signup -H 'Content-Type: application/json' -d '{"name":"A","email":"a@a.com","password":"secret123"}'
curl -X POST localhost:3000/api/nodb/login  -H 'Content-Type: application/json' -d '{"email":"a@a.com","password":"secret123"}'

# MongoDB signup/login -> JWT
curl -X POST localhost:3000/api/auth/signup -H 'Content-Type: application/json' -d '{"name":"A","email":"a@a.com","password":"secret123"}'
TOKEN=$(curl -s -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"a@a.com","password":"secret123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# Middleware -> get profile
curl localhost:3000/api/auth/profile -H "Authorization: Bearer $TOKEN"

# MongoDB CRUD
curl -X POST localhost:3000/api/items -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"title":"first","description":"hello"}'
curl localhost:3000/api/items -H "Authorization: Bearer $TOKEN"
curl -X PUT localhost:3000/api/items/<id> -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"title":"updated"}'
curl -X DELETE localhost:3000/api/items/<id> -H "Authorization: Bearer $TOKEN"

# Token versioning: log in a second time, then reuse the OLD token
# -> 401 "Session expired: logged in elsewhere or logged out"

# RBAC: normal user gets 403, admin gets 200
curl localhost:3000/api/admin/users -H "Authorization: Bearer $TOKEN"
# make an admin: ADMIN_EMAIL=x@x.com ADMIN_PASSWORD=secret123 npm run seed:admin

# File sharing
curl -X POST localhost:3000/api/files -H "Authorization: Bearer $TOKEN" -F file=@./README.md
curl -OJ localhost:3000/api/files/share/<shareId>     # no login needed

# Redis timestamp
curl localhost:3000/api/timestamp

# Rate limiting: /api/auth/login allows 10 per minute per IP, then 429
for i in $(seq 1 12); do curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"x","password":"y"}'; done
```
