
# QuickNotes REST API Design

## 1. Overview

QuickNotes uses a RESTful API to manage notes and users. Resources are represented using JSON, and HTTP methods describe the operations performed on them.

The API client prototype uses JSONPlaceholder at `https://jsonplaceholder.typicode.com/posts`. The endpoints below describe the proposed production API for a complete QuickNotes application. Some endpoints, such as updating notes and managing tags, are design specifications and are not implemented by the JSONPlaceholder prototype.

## 2. Base URL and conventions

**Proposed production base URL:** `https://api.quicknotes.example/v1`

- Data format: JSON
- Authentication: Bearer token for protected endpoints
- Resource identifiers: Unique IDs
- Timestamps: ISO 8601 format in UTC
- Successful requests return an appropriate HTTP status.
- Errors return a JSON object with a machine-readable code and a human-readable message.

## 3. REST API endpoints

| Method | Endpoint | Description | Success status |
|---|---|---|---|
| GET | `/notes` | List notes belonging to the authenticated user | 200 OK |
| GET | `/notes/{id}` | Retrieve one note by ID | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PUT | `/notes/{id}` | Replace an existing note | 200 OK |
| PATCH | `/notes/{id}` | Partially update a note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/users/me` | Retrieve the authenticated user's profile | 200 OK |
| GET | `/tags` | List tags available to the authenticated user | 200 OK |
| POST | `/notes/{id}/tags` | Associate a tag with a note | 201 Created |

The `.example` domain is a placeholder, not a deployed production server.

## 4. List notes

### Request

`GET /v1/notes?limit=10&offset=0`

The server returns a paginated list of notes belonging to the authenticated user.

### Successful response: 200 OK

```json
{
  "data": [
    {
      "id": 101,
      "userId": 1,
      "title": "Clinic appointment",
      "body": "Attend the clinic on Monday.",
      "createdAt": "2026-10-29T08:00:00Z",
      "updatedAt": "2026-10-29T08:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

## 5. Create a note

### Request

`POST /v1/notes`

Header:

`Content-Type: application/json`

Request body:

```json
{
  "title": "Clinic appointment",
  "body": "Attend the clinic on Monday."
}
```

The authenticated user's identity is obtained from the access token rather than trusting a user-supplied `userId`.

### Successful response: 201 Created

```json
{
  "data": {
    "id": 101,
    "userId": 1,
    "title": "Clinic appointment",
    "body": "Attend the clinic on Monday.",
    "createdAt": "2026-10-29T08:00:00Z",
    "updatedAt": "2026-10-29T08:00:00Z"
  }
}
```

The response includes the new resource ID so that the client can identify the created note.

## 6. Delete a note

### Request

`DELETE /v1/notes/101`

### Successful response: 204 No Content

The server returns no response body after successfully deleting the note.

If the note does not exist, the server returns `404 Not Found`.

## 7. Error handling

| HTTP status | Meaning | Example situation |
|---|---|---|
| 400 Bad Request | Invalid request | Missing title or malformed JSON |
| 401 Unauthorized | Authentication required or invalid | Missing or expired access token |
| 403 Forbidden | Access denied | User attempts to delete another user's note |
| 404 Not Found | Resource not found | Requested note does not exist |
| 500 Internal Server Error | Unexpected server failure | Database or application error |

### Example error response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The note title is required.",
    "details": {
      "field": "title"
    }
  }
}
```

The client should use the HTTP status and error body to display a helpful message without exposing internal server details.

## 8. Validation and security

- Require a non-empty title with a maximum length of 100 characters.
- Validate request bodies on the server, even if the browser also validates them.
- Authenticate protected requests.
- Verify that users can access only their own notes.
- Use HTTPS for requests in production.
- Apply pagination to list endpoints.
- Rate-limit requests to reduce abuse.
- Avoid returning access tokens, passwords, or other secrets in API responses.

## 9. Prototype limitations

The browser prototype uses JSONPlaceholder to demonstrate GET, POST, and DELETE requests. JSONPlaceholder simulates write operations rather than permanently storing changes. Therefore, creating or deleting a note in the prototype does not demonstrate persistent database storage.

The remaining endpoints in this document specify the intended REST API for a future production implementation.
