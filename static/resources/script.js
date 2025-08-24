let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const currentDate = new Date();
const currentDay = currentDate.getDate(); // Current day number
const currentMonthInJs = currentDate.getMonth(); // Current month in JS format (0-11)
const currentYearInJs = currentDate.getFullYear(); // Current year

// Function to update the displayed month/year in the header
function updateCurrentDate(year, month) {
    const now = new Date(year, month, 1); // Just use the 1st of the month

    const options = {
        year: 'numeric',
        month: 'long',  // Display the full month name
    };

    const formattedDate = now.toLocaleDateString(undefined, options);
    
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = formattedDate;
    }
}

function renderCalendar(year, month) {
    // Get the first day and number of days in the current month
    const firstDay = new Date(year, month, 1).getDay(); // Sunday = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get the number of days in the previous month
    const prevMonthDays = new Date(year, month, 0).getDate(); // Days in the previous month

    // Get the number of days in the next month
    const nextMonthDays = 42 - (firstDay + daysInMonth); // Total boxes - days of the current month

    // Clear the calendar before rendering
    for (let i = 0; i < 35; i++) {
        const box = document.querySelector(`.box-${i}`);
        if (!box) continue;

        // Clear old content
        box.innerHTML = `
            <p class="date-number"></p>
            <p class="day-event"></p>
        `;
        box.classList.remove("faded");
        box.classList.remove("current-day");
        box.classList.remove("adjacent-day");
    }

    // Fill in the current month days
    for (let date = 1; date <= daysInMonth; date++) {
        const index = firstDay + date - 1;
        const box = document.querySelector(`.box-${index}`);
        if (box) {
            box.querySelector(".date-number").textContent = date;

            // Highlight the current day with a hot pink border
            if (date === currentDay && month === currentMonthInJs && year === currentYearInJs) {
                box.classList.add("current-day");
            }
        }
    }

    // Fill in trailing days (from previous month)
    for (let date = prevMonthDays - firstDay + 1; date <= prevMonthDays; date++) {
        const index = firstDay - (prevMonthDays - date + 1);
        const box = document.querySelector(`.box-${index}`);
        if (box) {
            box.querySelector(".date-number").textContent = date;
            box.classList.add("faded");
            box.classList.add("adjacent-day"); // Add blue border for adjacent days (from previous month)
        }
    }

    // Fill in leading days (from next month)
    for (let date = 1; date <= nextMonthDays; date++) {
        const index = firstDay + daysInMonth + date - 1;
        const box = document.querySelector(`.box-${index}`);
        if (box) {
            box.querySelector(".date-number").textContent = date;
            box.classList.add("faded");
            box.classList.add("adjacent-day"); // Add blue border for adjacent days (from next month)
        }
    }

    // Update the header with the current month/year
    updateCurrentDate(year, month);
}

// Handle previous month button click
document.getElementById('previous-month').addEventListener('click', () => {
    // Decrease the month
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;  // December
        currentYear--;      // Decrease the year
    }

    // Re-render the calendar with the updated month and year
    renderCalendar(currentYear, currentMonth);
});

// Handle next month button click
document.getElementById('next-month').addEventListener('click', () => {
    // Increase the month
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;   // January
        currentYear++;      // Increase the year
    }

    // Re-render the calendar with the updated month and year
    renderCalendar(currentYear, currentMonth);
});

// Initialize the calendar display
renderCalendar(currentYear, currentMonth);

