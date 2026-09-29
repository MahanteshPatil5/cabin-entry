/**
 * SVCE CentreBook
 * Admin Dashboard
 */

const API_BASE_URL = "http://localhost:8080";


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    checkAdminAuth();

    setupGlobalEvents();

    loadDashboard();

});


// ==========================================
// ADMIN AUTH
// ==========================================

function checkAdminAuth() {

    if (
        sessionStorage.getItem("adminLoggedIn")
        !== "true"
    ) {

        window.location.href =
            "admin-login.html";

    }

}


// ==========================================
// EVENTS
// ==========================================

function setupGlobalEvents() {

    // Logout

    const logoutBtn =
        document.getElementById(
            "adminLogoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    "adminLoggedIn"
                );

                sessionStorage.removeItem(
                    "adminId"
                );

                window.location.href =
                    "admin-login.html";

            }
        );

    }



    // Refresh

    const refreshBtn =
        document.getElementById(
            "refreshDashboardBtn"
        );


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadDashboard
        );

    }

}


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    const alertBox =
        document.getElementById(
            "dashboardAlert"
        );


    try {

        // Show loading state

        setDashboardLoading();


        const response =
            await fetch(
                `${API_BASE_URL}/api/admin/dashboard`
            );


        if (!response.ok) {

            throw new Error(
                "Dashboard API failed"
            );

        }


        const data =
            await response.json();


        console.log(
            "Dashboard data:",
            data
        );


        // Summary

        updateSummaryCards(data);


        // Live cabins

        renderLiveCabins(
            data.cabinStatus || []
        );


        // Analytics

        renderAnalytics(data);


        // Hide alert

        if (alertBox) {

            alertBox.classList.add(
                "hidden"
            );

        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        showAlert(
            alertBox,
            "Could not load live dashboard data. Make sure the Spring Boot backend is running.",
            "error"
        );

    }

}


// ==========================================
// SUMMARY CARDS
// ==========================================

function updateSummaryCards(data) {

    setText(
        "totalCabins",
        data.totalCabins ?? 0
    );


    setText(
        "availableCabins",
        data.availableCabins ?? 0
    );


    setText(
        "partiallyOccupiedCabins",
        data.partiallyOccupiedCabins ?? 0
    );


    setText(
        "fullCabins",
        data.fullCabins ?? 0
    );


    setText(
        "peopleInside",
        data.peopleInside ?? 0
    );


    setText(
        "todayVisits",
        data.todayVisits ?? 0
    );


    setText(
        "activeVisits",
        data.activeVisits ?? 0
    );


    setText(
        "completedVisitsToday",
        data.completedVisitsToday ?? 0
    );

}


// ==========================================
// LIVE CABIN STATUS
// ==========================================

function renderLiveCabins(cabins) {

    const container =
        document.getElementById(
            "liveOccupancyContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    if (
        !cabins ||
        cabins.length === 0
    ) {

        container.innerHTML = `
            <div class="text-center width-full">
                No cabins available.
            </div>
        `;

        return;

    }


    cabins.forEach(cabin => {

        const card =
            document.createElement("div");


        const status =
            cabin.status || "AVAILABLE";


        let statusClass =
            "status-available";


        let statusText =
            "AVAILABLE";


        if (status === "FULL") {

            statusClass =
                "status-full";

            statusText =
                "FULL";

        }

        else if (
            status === "PARTIAL"
        ) {

            statusClass =
                "status-partially";

            statusText =
                "PARTIALLY OCCUPIED";

        }


        card.className =
            `cabin-card ${statusClass}`;


        card.innerHTML = `

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:12px;
            ">

                <strong class="cabin-name">
                    ${escapeHtml(
                        cabin.name || "Unknown Cabin"
                    )}
                </strong>

                <span class="cabin-status">
                    ${statusText}
                </span>

            </div>


            <div style="
                font-size:0.9rem;
                color:var(--text-muted);
            ">

                <p>
                    Capacity:
                    <strong>
                        ${cabin.capacity ?? 0}
                    </strong>
                </p>


                <p>
                    Occupied:
                    <strong>
                        ${cabin.occupied ?? 0}
                    </strong>
                </p>


                <p>
                    Available:
                    <strong>
                        ${cabin.available ?? 0}
                    </strong>
                </p>

            </div>

        `;


        container.appendChild(card);

    });

}


// ==========================================
// ANALYTICS
// ==========================================

function renderAnalytics(data) {

    renderBarList(
        "mostUsedCabins",
        data.mostUsedCabins || [],
        "visits"
    );


    renderBarList(
        "roleUsage",
        data.roleUsage || [],
        "visits"
    );


    renderBarList(
        "averagePeoplePerCabin",
        data.averagePeoplePerCabin || [],
        "people"
    );

}


// ==========================================
// ANALYTICS BAR LIST
// ==========================================

function renderBarList(
    containerId,
    items,
    unit
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) return;


    container.innerHTML = "";


    if (
        !items ||
        items.length === 0
    ) {

        container.innerHTML = `
            <p style="
                color:var(--text-muted);
                font-size:0.875rem;
            ">
                No records available.
            </p>
        `;

        return;

    }


    const maxValue =
        Math.max(
            ...items.map(
                item => Number(item.value) || 0
            ),
            1
        );


    items.forEach(item => {

        const value =
            Number(item.value) || 0;


        const percentage =
            Math.round(
                (value / maxValue) * 100
            );


        const div =
            document.createElement("div");


        div.className =
            "analytics-item";


        div.innerHTML = `

            <div class="analytics-label">

                <span>
                    ${escapeHtml(
                        item.label || "Unknown"
                    )}
                </span>

                <strong>
                    ${value} ${unit}
                </strong>

            </div>


            <div class="bar-container">

                <div
                    class="bar-fill"
                    style="width:${percentage}%">
                </div>

            </div>

        `;


        container.appendChild(div);

    });

}


// ==========================================
// LOADING STATE
// ==========================================

function setDashboardLoading() {

    const ids = [

        "totalCabins",
        "availableCabins",
        "partiallyOccupiedCabins",
        "fullCabins",
        "peopleInside",
        "todayVisits",
        "activeVisits",
        "completedVisitsToday"

    ];


    ids.forEach(id => {

        setText(id, "...");

    });

}


// ==========================================
// SET TEXT
// ==========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

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


    element.textContent =
        message;


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

    if (
        value === null ||
        value === undefined
    ) {

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