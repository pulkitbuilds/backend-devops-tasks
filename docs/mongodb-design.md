# MongoDB database design (system diagram)

```mermaid
erDiagram
    USER ||--o{ ITEM : owns
    USER ||--o{ FILE : uploads

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password "bcrypt hash"
        string role "user | admin"
        number tokenVersion "single-session login"
        date createdAt
        date updatedAt
    }
    ITEM {
        ObjectId _id PK
        string title
        string description
        ObjectId owner FK "index"
        date createdAt
        date updatedAt
    }
    FILE {
        ObjectId _id PK
        string originalName
        string storedName
        string mimeType
        number size
        string shareId UK "public link id"
        ObjectId owner FK "index"
        date createdAt
    }
```

## System diagram

```mermaid
flowchart LR
    B[Browser: login page, dashboard] -->|HTTP + JWT| A[Express API in Docker]
    A -->|Mongoose| M[(MongoDB: users, items, files)]
    A -->|INCR / GET / SET| R[(Redis: rate limits, timestamp)]
    A -->|multer| D[/uploads disk/]
    GH[GitHub Actions] -->|build and push image| REG[ghcr.io]
    REG -->|pull| EC2[AWS EC2 / Kubernetes pod]
    EC2 --- A
```

## Design decisions
- **References, not embedding**: items and files point to their owner with an `owner` ObjectId. They grow without bound, so embedding them in the user document would not scale.
- **Indexes**: unique on `User.email` and `File.shareId`; secondary on `Item.owner` and `File.owner` for per-user queries.
- **Auth fields on User**: `role` for RBAC and `tokenVersion` for single-session login.
- **Passwords** are stored only as bcrypt hashes.
