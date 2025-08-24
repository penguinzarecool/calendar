// ============================
// Event popup handling
// ============================
function openEventPopup(event) {
    const popup = document.getElementById('event-popup');

    const clickedDate = event.target.querySelector('.date-number').innerText;

    // Get month and year from the #current-date element
    const headerText = document.getElementById('current-date').innerText; // e.g., "April 2025"
    const dateString = `${headerText} ${clickedDate}`; // e.g., "April 2025 16"

    document.getElementById('popup-date').innerText = `Event Date: ${dateString}`;
    popup.style.display = 'block';

    document.getElementById('close-popup').addEventListener('click', function () {
        popup.style.display = 'none';
    });

    window.onclick = function (event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    };
}

// ============================
// Calendar listeners
// ============================
function setupCalendarEventListeners() {
    const dateBoxes = document.querySelectorAll('.day');

    dateBoxes.forEach(dateBox => {
        dateBox.addEventListener('click', function (event) {
            openEventPopup(event);
        });
    });
}

// ============================
// Save new event (Go backend)
// ============================
function saveEventToBackend(eventData) {
    if (window.saveEvent) {
        window.saveEvent(eventData)
            .then(() => {
                alert("Event saved!");
                fetchAndDisplayEvents(); // Refresh after save
            })
            .catch(err => console.error("Error saving event:", err));
    } else {
        console.error("saveEvent binding not available");
    }
}

// ============================
// Fetch events (Go backend)
// ============================
function fetchAndDisplayEvents() {
    const currentDateText = document.getElementById('current-date').textContent;
    const [monthName, year] = currentDateText.split(' ');
    const month = new Date(`${monthName} 1, ${year}`).getMonth() + 1; // 1-indexed

    if (window.loadEvents) {
        window.loadEvents(month, parseInt(year))
            .then(events => {
                console.log("DEBUG events from Go:", events);

                // If null/undefined, replace with empty array
                if (!Array.isArray(events)) {
                    console.warn("Expected array, got:", events);
                    events = [];
                }

                showEvents({ events: events });
            })
            .catch(err => console.error("Error loading events:", err));
    }

}

// ============================
// Render events into calendar
// ============================
window.showEvents = function (data) {
    const events = data.events;

    // Clear old events
    document.querySelectorAll('.day').forEach(box => {
        const eventElement = box.querySelector('.day-event');
        if (eventElement) eventElement.textContent = '';
    });

    // Insert new events
    events.forEach(event => {
        const dateObj = new Date(event.date);
        const day = dateObj.getDate();

        const dayBox = document.querySelector(`.box-${day - 1}`);
        if (dayBox) {
            const eventElement = dayBox.querySelector('.day-event');
            if (eventElement) {
                eventElement.textContent = `${event.time} - ${event.description}`;
            }
        }
    });
};

// ============================
// Init on page load
// ============================
document.addEventListener('DOMContentLoaded', function () {
    setupCalendarEventListeners();

    const form = document.getElementById('event-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const description = document.getElementById('event-description').value;
            const urgency = document.getElementById('event-urgency').value;
            const time = document.getElementById('event-time').value;

            const dateText = document.getElementById('popup-date').innerText;
            const date = dateText.replace("Event Date: ", "").trim(); // e.g., "April 2025 16"

            const eventData = {
                date: date,
                description: description,
                urgency: parseInt(urgency),
                time: time
            };

            saveEventToBackend(eventData);

            document.getElementById('event-popup').style.display = 'none';
        });
    }

    // Initial load
    fetchAndDisplayEvents();
});

// ============================
// Re-fetch on month nav
// ============================
document.getElementById('previous-month').addEventListener('click', () => {
    fetchAndDisplayEvents();
});

document.getElementById('next-month').addEventListener('click', () => {
    fetchAndDisplayEvents();
});

