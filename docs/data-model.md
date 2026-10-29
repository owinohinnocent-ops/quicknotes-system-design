
# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database to store users, notes, tags, and the relationships between notes and tags.

The proposed design uses PostgreSQL. A relational database is suitable because notes belong to users, records need clear relationships, and transactions help maintain data integrity.

## 2. Entities and columns

### 2.1 Users

| Column | Data type | Constraints | Purpose |
|---|---|---|---|
| id | BIGINT | Primary key, generated | Unique user identifier |
| name | VARCHAR(100) | NOT NULL | User's display name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Securely stored password hash |
| created_at | TIMESTAMPTZ | NOT NULL, default current time | Account creation time |

### 2.2 Notes

| Column | Data type | Constraints | Purpose |
|---|---|---|---|
| id | BIGINT | Primary key, generated | Unique note identifier |
| user_id | BIGINT | Foreign key, NOT NULL | Owner of the note |
| title | VARCHAR(100) | NOT NULL | Note title |
| body | TEXT | NOT NULL | Note content |
| created_at | TIMESTAMPTZ | NOT NULL, default current time | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, default current time | Last update timestamp |

### 2.3 Tags

| Column | Data type | Constraints | Purpose |
|---|---|---|---|
| id | BIGINT | Primary key, generated | Unique tag identifier |
| user_id | BIGINT | Foreign key, NOT NULL | User who owns the tag |
| name | VARCHAR(50) | NOT NULL | Tag name |

A unique constraint on `(user_id, name)` prevents a user from creating duplicate tags with the same name.

### 2.4 Note_tags

| Column | Data type | Constraints | Purpose |
|---|---|---|---|
| note_id | BIGINT | Primary key component, foreign key | Linked note |
| tag_id | BIGINT | Primary key component, foreign key | Linked tag |

The composite primary key `(note_id, tag_id)` prevents the same tag from being associated with the same note more than once.

## 3. Relationships

- **Users to notes:** One-to-many. One user can own many notes, while each note belongs to one user.
- **Users to tags:** One-to-many. One user can create many tags.
- **Notes to tags:** Many-to-many. One note can have multiple tags, and one tag can be applied to multiple notes.
- **Note_tags:** The junction table that implements the many-to-many relationship between notes and tags.

## 4. SQL table definitions

The following PostgreSQL statements create the four tables in dependency order.

### 4.1 Users table

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Notes table

```sql
CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 Tags table

```sql
CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT unique_user_tag UNIQUE (user_id, name)
);
```

### 4.4 Note_tags table

```sql
CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

Foreign keys maintain referential integrity. Cascading deletion removes dependent notes and tag relationships when their parent records are deleted. A production application should also verify that a note and its assigned tag belong to the same user.

## 5. SQL queries

### Query 1: Retrieve a user's notes

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC
LIMIT 10;
```

**Purpose:** Retrieves up to ten notes for a user, displaying recently updated notes first.

### Query 2: Find notes with their tags

```sql
SELECT
    n.id AS note_id,
    n.title,
    t.name AS tag_name
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 1
ORDER BY n.id, t.name;
```

**Purpose:** Demonstrates JOIN operations to retrieve notes and their associated tags.

### Query 3: Count notes belonging to each user

```sql
SELECT
    u.id,
    u.name,
    COUNT(n.id) AS total_notes
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total_notes DESC;
```

**Purpose:** Counts notes for each user, including users who have not created any notes.

### Query 4: Search note titles

```sql
SELECT id, title, body
FROM notes
WHERE user_id = 1
  AND title ILIKE '%clinic%'
ORDER BY updated_at DESC;
```

**Purpose:** Searches a user's note titles without case sensitivity in PostgreSQL.

## 6. Indexing

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);
```

**Justification:** The index supports queries that filter notes by `user_id` and sort them by `updated_at`. This can reduce the work required to retrieve a user's most recently updated notes.

Indexes improve some read operations but consume storage and add overhead to inserts, updates, and deletes. They should be chosen based on common query patterns.

The primary keys, unique constraints, and foreign-key constraints also create or rely on database indexes as appropriate; a separate index on every column is unnecessary.

## 7. SQL versus NoSQL

### Why SQL is appropriate

- **Relationships:** Users, notes, and tags have clear relationships that are naturally represented by foreign keys and a junction table.
- **Data integrity:** Constraints help prevent invalid references and duplicate records.
- **Transactions:** Transactions can keep related operations consistent, such as creating a note and associating tags.
- **Flexible queries:** JOINs support reports and retrieval of notes alongside their tags.
- **Structured records:** Most fields have predictable types and constraints.

### When NoSQL might be useful

A document database could be useful if notes contained highly variable structures, such as deeply nested blocks, attachments metadata, or changing custom fields. It may also fit a system whose access patterns favour retrieving whole documents without joins.

However, those benefits do not outweigh the relational model's advantages for the core QuickNotes requirements. PostgreSQL is therefore the recommended starting point. NoSQL could be evaluated later if measured workloads or new requirements justify it.

## 8. Data integrity and security considerations

- Store password hashes rather than plain-text passwords.
- Enforce ownership checks before reading, updating, or deleting notes.
- Validate titles and other inputs at the application and database levels where appropriate.
- Use parameterized SQL queries to reduce SQL injection risk.
- Use transactions for operations involving multiple related records.
- Back up the database and test restoration procedures.
