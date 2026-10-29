
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusElement = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");

let displayedNotes = [];

// Reusable helper for all API requests.
async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
    }

    // DELETE may return an empty response body.
    if (response.status === 204) {
        return { data: null, status: response.status };
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    return {
        data,
        status: response.status
    };
}

function showStatus(message, type = "info") {
    statusElement.textContent = message;
    statusElement.dataset.type = type;
}

function createElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    // Use textContent so note text is treated as text, not HTML.
    element.textContent = text;

    return element;
}

function renderNotes() {
    notesList.replaceChildren();

    if (displayedNotes.length === 0) {
        const emptyItem = createElement(
            "li",
            "empty-state",
            "No notes to display. Load notes or create your first note."
        );

        notesList.appendChild(emptyItem);
        return;
    }

    displayedNotes.forEach((note) => {
        const listItem = createElement("li", "note-item", "");
        const heading = createElement("h3", "", note.title || "Untitled note");
        const body = createElement("p", "", note.body || "");
        const deleteButton = createElement("button", "delete-btn", "Delete note");

        deleteButton.type = "button";
        deleteButton.dataset.noteId = String(note.id);
        deleteButton.setAttribute(
            "aria-label",
            `Delete note ${note.id}`
        );

        listItem.append(heading, body, deleteButton);
        notesList.appendChild(listItem);
    });
}

// GET: Load the first 10 notes.
async function loadNotes() {
    loadButton.disabled = true;
    showStatus("Loading notes...");

    try {
        const result = await request(`${API_URL}?_limit=10`);

        displayedNotes = Array.isArray(result.data) ? result.data : [];
        renderNotes();

        if (displayedNotes.length === 0) {
            showStatus("No notes were found on the server.", "info");
        } else {
            showStatus(
                `Loaded ${displayedNotes.length} notes from the server.`,
                "success"
            );
        }
    } catch (error) {
        showStatus(
            "Unable to load notes. Check your internet connection and try again.",
            "error"
        );
        console.error("Load notes error:", error);
    } finally {
        loadButton.disabled = false;
    }
}

// POST: Create a note.
async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title) {
        showStatus("Please enter a note title.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showStatus("The title must not exceed 100 characters.", "error");
        titleInput.focus();
        return;
    }

    if (!body) {
        showStatus("Please enter the note content.", "error");
        bodyInput.focus();
        return;
    }

    submitButton.disabled = true;
    showStatus("Creating note...");

    try {
        const result = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                body,
                userId: 1
            })
        });

        const newNote = result.data;

        if (!newNote || newNote.id === undefined) {
            throw new Error("The server did not return a note ID.");
        }

        displayedNotes.unshift(newNote);
        renderNotes();
        noteForm.reset();

        showStatus(
            `Note created (status ${result.status}, id ${newNote.id}).`,
            "success"
        );

        // JSONPlaceholder simulates POST requests; it does not permanently
        // save the new note. The note is added to this page's local display.
    } catch (error) {
        showStatus(
            "Unable to create the note. Please check your connection and try again.",
            "error"
        );
        console.error("Create note error:", error);
    } finally {
        submitButton.disabled = false;
    }
}

// DELETE: Remove a note from the API and then from the displayed list.
async function deleteNote(noteId, deleteButton) {
    deleteButton.disabled = true;
    showStatus(`Deleting note ${noteId}...`);

    try {
        await request(`${API_URL}/${encodeURIComponent(noteId)}`, {
            method: "DELETE"
        });

        displayedNotes = displayedNotes.filter(
            (note) => String(note.id) !== String(noteId)
        );

        renderNotes();
        showStatus(`Note ${noteId} deleted successfully.`, "success");

        // JSONPlaceholder simulates deletion; it does not persist changes.
    } catch (error) {
        showStatus(
            `Unable to delete note ${noteId}. Please try again.`,
            "error"
        );
        console.error("Delete note error:", error);
    } finally {
        deleteButton.disabled = false;
    }
}

// Event listeners.
loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

notesList.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement)) {
        return;
    }

    if (!target.classList.contains("delete-btn")) {
        return;
    }

    const noteId = target.dataset.noteId;

    if (noteId) {
        deleteNote(noteId, target);
    }
});

// Display the initial empty state.
renderNotes();
