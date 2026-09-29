/**
 * SVCE CentreBook - Admin History
 */

const API_BASE_URL = "http://localhost:8080";

let historyDataList = [];


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    checkAdminAuth();

    setupGlobalEvents();

    setupHistoryFilters();

    loadHistory();

});


// ==========================================
// ADMIN AUTH
// ==========================================

function checkAdminAuth() {

    if (sessionStorage.getItem("adminLoggedIn") !== "true") {

        window.location.href = "admin-login.html";

    }

}


// ==========================================
// GLOBAL EVENTS
// ==========================================

function setupGlobalEvents() {

    const logoutBtn =
        document.getElementById("adminLogoutBtn");


    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            sessionStorage.removeItem("adminLoggedIn");

            sessionStorage.removeItem("adminId");

            window.location.href = "admin-login.html";

        });

    }

}


// ==========================================
// FILTER EVENTS
// ==========================================

function setupHistoryFilters() {

    const filterBtn =
        document.getElementById("historyFilterBtn");

    const resetBtn =
        document.getElementById("historyResetBtn");


    if (filterBtn) {

        filterBtn.addEventListener(
            "click",
            filterHistory
        );

    }


    if (resetBtn) {

        resetBtn.addEventListener(
            "click",
            resetHistory
        );

    }

}


// ==========================================
// LOAD HISTORY FROM BACKEND
// ==========================================

async function loadHistory() {

    const msgBox =
        document.getElementById("historyMessage");


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/history`
        );


        if (!response.ok) {

            throw new Error(
                "History API unavailable"
            );

        }


        historyDataList =
            await response.json();


        populateCabinFilter(
            historyDataList
        );


        renderHistory(
            historyDataList
        );


    } catch (error) {

        console.error(
            "History loading error:",
            error
        );


        showAlert(
            msgBox,
            "Could not load history from backend.",
            "error"
        );


        const tbody =
            document.getElementById(
                "historyTableBody"
            );


        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Unable to load history records.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// CABIN FILTER
// ==========================================

function populateCabinFilter(data) {

    const cabinSelect =
        document.getElementById(
            "historyCabinFilter"
        );


    if (!cabinSelect) return;


    // Remove old dynamic options
    cabinSelect.innerHTML =
        `<option value="">All Cabins</option>`;


    const cabins = [
        ...new Set(
            data
                .map(item => item.cabin)
                .filter(Boolean)
        )
    ];


    cabins.forEach(cabin => {

        const option =
            document.createElement("option");


        option.value = cabin;

        option.textContent = cabin;


        cabinSelect.appendChild(option);

    });

}


// ==========================================
// FILTER HISTORY
// ==========================================

function filterHistory() {

    const search =
        document
            .getElementById("historySearch")
            .value
            .toLowerCase()
            .trim();


    const cabin =
        document
            .getElementById("historyCabinFilter")
            .value;


    const role =
        document
            .getElementById("historyRoleFilter")
            .value;


    const dateFrom =
        document
            .getElementById("historyDateFrom")
            .value;


    const dateTo =
        document
            .getElementById("historyDateTo")
            .value;


    const filtered =
        historyDataList.filter(item => {


            // Search
            const matchesSearch =
                !search ||
                (item.name &&
                    item.name
                        .toLowerCase()
                        .includes(search)) ||
                (item.usn &&
                    item.usn
                        .toLowerCase()
                        .includes(search));


            // Cabin
            const matchesCabin =
                !cabin ||
                item.cabin === cabin;


            // Role
            const matchesRole =
                !role ||
                item.role === role;


            // Date
            let matchesDate = true;


            if (item.entryTime) {

                const entryDate =
                    item.entryTime.substring(0, 10);


                if (dateFrom) {

                    matchesDate =
                        matchesDate &&
                        entryDate >= dateFrom;

                }


                if (dateTo) {

                    matchesDate =
                        matchesDate &&
                        entryDate <= dateTo;

                }

            }


            return (
                matchesSearch &&
                matchesCabin &&
                matchesRole &&
                matchesDate
            );

        });


    renderHistory(filtered);

}


// ==========================================
// RESET FILTER
// ==========================================

function resetHistory() {

    document.getElementById(
        "historySearch"
    ).value = "";


    document.getElementById(
        "historyCabinFilter"
    ).value = "";


    document.getElementById(
        "historyRoleFilter"
    ).value = "";


    document.getElementById(
        "historyDateFrom"
    ).value = "";


    document.getElementById(
        "historyDateTo"
    ).value = "";


    renderHistory(historyDataList);

}


// ==========================================
// RENDER TABLE
// ==========================================

function renderHistory(list) {

    const tbody =
        document.getElementById(
            "historyTableBody"
        );


    tbody.innerHTML = "";


    if (!list || list.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No history records found.
                </td>
            </tr>
        `;

        return;

    }


    list.forEach(item => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHtml(item.name || "N/A")}
                </strong>
            </td>


            <td>
                <span class="badge">
                    ${escapeHtml(item.role || "N/A")}
                </span>
            </td>


            <td>
                ${escapeHtml(item.usn || "N/A")}
            </td>


            <td>
                ${item.peopleCount || 0}
            </td>


            <td>
                ${escapeHtml(item.cabin || "N/A")}
            </td>


            <td>
                ${formatTime(item.entryTime, item.exitTime)}
            </td>

        `;


        tbody.appendChild(row);

    });

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(entryTime, exitTime) {

    const entry =
        formatDateTime(entryTime);


    const exit =
        exitTime
            ? formatDateTime(exitTime)
            : "Active";


    return `
        <div>
            <strong>Entry:</strong> ${entry}
        </div>

        <div>
            <strong>Exit:</strong> ${exit}
        </div>
    `;

}


// ==========================================
// FORMAT DATE/TIME
// ==========================================

function formatDateTime(dateTime) {

    if (!dateTime) {

        return "N/A";

    }


    const date =
        new Date(dateTime);


    if (isNaN(date.getTime())) {

        return dateTime;

    }


    return date.toLocaleString();

}


// ==========================================
// ALERT
// ==========================================

function showAlert(
    element,
    message,
    type
) {

    if (!element) return;


    element.textContent = message;


    element.className =
        `alert ${type}`;


    element.classList.remove(
        "hidden"
    );

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value).replace(
        /[&<>"']/g,
        match => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[match]
    );

}