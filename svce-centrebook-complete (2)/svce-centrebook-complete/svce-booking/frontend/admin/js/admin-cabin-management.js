/**
 * SVCE CentreBook - Admin Cabin Management
 */

const API_BASE_URL = "http://localhost:8080";

let rawCabinsList = [];

document.addEventListener("DOMContentLoaded", () => {

    checkAdminAuth();
    setupGlobalEvents();
    setupCabinFormEvents();
    loadCabins();

});


/* ================================
   ADMIN AUTHENTICATION
================================ */

function checkAdminAuth() {

    if (sessionStorage.getItem("adminLoggedIn") !== "true") {

        window.location.href = "admin-login.html";

    }

}


/* ================================
   GLOBAL EVENTS
================================ */

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


/* ================================
   FORM EVENTS
================================ */

function setupCabinFormEvents() {

    document
        .getElementById("saveCabinBtn")
        .addEventListener("click", saveCabin);


    document
        .getElementById("cancelCabinBtn")
        .addEventListener("click", resetCabinForm);


    document
        .getElementById("cabinSearch")
        .addEventListener("input", (event) => {

            const term =
                event.target.value.toLowerCase();

            const filtered =
                rawCabinsList.filter(cabin =>

                    cabin.name
                        .toLowerCase()
                        .includes(term)

                    ||

                    cabin.type
                        .toLowerCase()
                        .includes(term)

                );

            renderCabinsTable(filtered);

        });

}


/* ================================
   LOAD CABINS
================================ */

async function loadCabins() {

    const msgBox =
        document.getElementById("cabinMessage");

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/admin/cabins`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load cabins"
            );

        }


        rawCabinsList =
            await response.json();


        renderCabinsTable(rawCabinsList);


    } catch (error) {

        console.error(error);

        showAlert(
            msgBox,
            "Unable to load cabins from backend.",
            "error"
        );

    }

}


/* ================================
   DISPLAY CABINS
================================ */

function renderCabinsTable(cabins) {

    const tbody =
        document.getElementById("cabinTableBody");

    tbody.innerHTML = "";


    if (cabins.length === 0) {

        tbody.innerHTML =
            '<tr><td colspan="7" class="text-center">No cabins found.</td></tr>';

        return;

    }


    cabins.forEach(cabin => {

        const status =
            getCabinStatus(cabin);


        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>${cabin.id}</td>

            <td>
                <strong>
                    ${escapeHtml(cabin.name)}
                </strong>
            </td>

            <td>
                ${escapeHtml(cabin.type)}
            </td>

            <td>
                ${cabin.capacity}
            </td>

            <td>
                ${cabin.occupied} / ${cabin.capacity}
            </td>

            <td>
                <span class="badge">
                    ${status}
                </span>
            </td>

            <td>

                <button
                    class="btn btn-secondary btn-sm"
                    onclick="editCabin(${cabin.id})">
                    Edit
                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteCabin(${cabin.id}, ${cabin.occupied})">
                    Delete
                </button>

            </td>

        `;


        tbody.appendChild(tr);

    });

}


/* ================================
   CABIN STATUS
================================ */

function getCabinStatus(cabin) {

    if (cabin.occupied === 0) {

        return "AVAILABLE";

    }

    if (cabin.occupied >= cabin.capacity) {

        return "FULL";

    }

    return "PARTIAL";

}


/* ================================
   EDIT CABIN
================================ */

function editCabin(id) {

    const cabin =
        rawCabinsList.find(
            cabin => cabin.id === id
        );


    if (!cabin) return;


    document.getElementById("cabinId").value =
        cabin.id;


    document.getElementById("cabinName").value =
        cabin.name;


    document.getElementById("cabinType").value =
        cabin.type;


    document.getElementById("cabinCapacity").value =
        cabin.capacity;


    document.getElementById("formTitle").textContent =
        `Edit Cabin #${cabin.id}`;

}


/* ================================
   RESET FORM
================================ */

function resetCabinForm() {

    document
        .getElementById("addCabinForm")
        .reset();


    document.getElementById("cabinId").value =
        "";


    document.getElementById("formTitle").textContent =
        "Add New Cabin";

}


/* ================================
   ADD / UPDATE CABIN
================================ */

async function saveCabin() {

    const msgBox =
        document.getElementById("cabinMessage");


    const id =
        document.getElementById("cabinId").value;


    const name =
        document.getElementById("cabinName")
            .value
            .trim();


    const type =
        document.getElementById("cabinType")
            .value;


    const capacity =
        parseInt(
            document.getElementById("cabinCapacity")
                .value,
            10
        );


    if (!name || !type || isNaN(capacity)) {

        showAlert(
            msgBox,
            "Please enter cabin name, type and capacity.",
            "error"
        );

        return;

    }


    const payload = {

        name: name,

        type: type,

        capacity: capacity

    };


    const method =
        id ? "PUT" : "POST";


    const url =
        id
            ? `${API_BASE_URL}/api/admin/cabins/${id}`
            : `${API_BASE_URL}/api/admin/cabins`;


    try {

        const response =
            await fetch(url, {

                method: method,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)

            });


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Server error:",
                errorText
            );

            throw new Error(
                "Server rejected the operation"
            );

        }


        showAlert(
            msgBox,
            id
                ? "Cabin updated successfully."
                : "Cabin added successfully.",
            "success"
        );


        resetCabinForm();


        await loadCabins();


    } catch (error) {

        console.error(error);

        showAlert(
            msgBox,
            "Failed to save cabin.",
            "error"
        );

    }

}


/* ================================
   DELETE CABIN
================================ */

async function deleteCabin(
    id,
    currentOccupancy
) {

    const msgBox =
        document.getElementById("cabinMessage");


    if (currentOccupancy > 0) {

        alert(
            "Cannot delete a cabin while it is occupied."
        );

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete Cabin #${id}?`
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/admin/cabins/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Delete failed"
            );

        }


        showAlert(
            msgBox,
            "Cabin deleted successfully.",
            "success"
        );


        await loadCabins();


    } catch (error) {

        console.error(error);

        showAlert(
            msgBox,
            "Unable to delete cabin.",
            "error"
        );

    }

}


/* ================================
   ALERT
================================ */

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


    setTimeout(() => {

        element.classList.add(
            "hidden"
        );

    }, 4000);

}


/* ================================
   HTML SECURITY
================================ */

function escapeHtml(str) {

    if (!str) return "";


    return str.replace(
        /[&<>"']/g,
        match => ({

            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'

        })[match]
    );

}