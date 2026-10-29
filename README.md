
# QuickNotes System Design

QuickNotes is a browser-based notes application prototype that demonstrates REST API operations and documents a proposed architecture for a scalable notes service.

The project combines a simple HTML, CSS, and JavaScript client with API design, relational database modelling, and system architecture documentation.

## Features

- Retrieve up to 10 notes from a REST API using GET.
- Create notes using POST.
- Delete notes using DELETE.
- Validate note titles and required fields.
- Display loading, success, empty, and error states.
- Disable relevant buttons while requests are in progress.
- Safely display note content using DOM text properties.
- Document a proposed production REST API, PostgreSQL data model, and scalable architecture.

## Technologies

- HTML5
- CSS3
- JavaScript (Fetch API and async/await)
- JSONPlaceholder REST API
- PostgreSQL for the proposed production data model
- Mermaid for the architecture diagram

## Project structure

```text
quicknotes-system-design/
├── index.html
├── style.css
├── api.js
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## How to run the application

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` with the VS Code Live Server extension, or open it directly in a browser.
4. Click **Load notes** to retrieve notes from JSONPlaceholder.
5. Enter a title and note content, then click **Create note**.
6. Use **Delete note** to remove a note from the current display and send the DELETE request.

An internet connection is required to contact JSONPlaceholder.

### API behaviour and limitations

The prototype uses `https://jsonplaceholder.typicode.com/posts`.

JSONPlaceholder simulates POST and DELETE operations; it does not permanently save these changes. A created note can appear in the current page, but refreshing the page may not preserve it. This prototype does not include a production backend, authentication, or a persistent database.

The production API endpoints and database schema are design proposals documented in the files below.

## Documentation

- [REST API Design](docs/api-design.md)
- [Data Model](docs/data-model.md)
- [System Architecture](docs/architecture.md)

## What I learned

1. How HTTP methods and status codes support REST API operations.
2. How to use asynchronous JavaScript, Fetch API, and error handling to communicate with a server.
3. Why user-provided text should be inserted safely using `textContent` rather than interpreted as HTML.
4. How relational database tables, primary keys, foreign keys, and JOIN queries represent application data.
5. How load balancers, caching, replicas, queues, and workers can support a scalable system.
6. Why capacity estimates should be based on explicit assumptions and validated against real workloads.

## Project status

This is a learning project. The browser client demonstrates basic API interactions, while the production REST API, PostgreSQL schema, and scalable infrastructure are documented as proposed designs.
