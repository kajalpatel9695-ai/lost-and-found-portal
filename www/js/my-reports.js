import { db, auth } from "./firebase.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const myReports = document.getElementById("myReports");

// Load reports belonging to the logged-in user
async function loadMyReports(user) {
  try {
    myReports.innerHTML = "<p>Loading your reports...</p>";

    const lostSnapshot = await getDocs(collection(db, "lostItems"));
    const foundSnapshot = await getDocs(collection(db, "foundItems"));

    let reports = [];

    // Lost reports
    lostSnapshot.forEach(function (docSnap) {
      const data = docSnap.data();

      if (data.userId === user.uid) {
        reports.push({
          id: docSnap.id,
          type: "Lost",
          personName: data.personName || "",
          itemName: data.itemName || "",
          category: data.category || "",
          location: data.location || "",
          date: data.dateLost || "",
          description: data.description || "",
          contact: data.contact || "",
          photo: data.photo || ""
        });
      }
    });

    // Found reports
    foundSnapshot.forEach(function (docSnap) {
      const data = docSnap.data();

      if (data.userId === user.uid) {
        reports.push({
          id: docSnap.id,
          type: "Found",
          personName: data.personName || "",
          itemName: data.itemName || "",
          category: data.category || "",
          location: data.location || "",
          date: data.dateFound || "",
          description: data.description || "",
          contact: data.contact || "",
          photo: data.photo || ""
        });
      }
    });

    // No reports found
    if (reports.length === 0) {
      myReports.innerHTML = `
        <h3>No Reports Found</h3>
        <p>You have not reported any lost or found item yet.</p>
      `;
      return;
    }

    myReports.innerHTML = "";

    // Display reports
    reports.forEach(function (report) {
      const reportBox = document.createElement("div");
      reportBox.className = "item-card";

      const photoHTML =
        report.photo && report.photo.trim() !== ""
          ? `<img src="${report.photo}" width="150" alt="Item Photo"><br><br>`
          : "";

      // Build the report card using textContent for user-entered text
      const title = document.createElement("h3");
      title.textContent = `${report.type} Item`;
      reportBox.appendChild(title);

      if (photoHTML) {
        const photo = document.createElement("img");
        photo.src = report.photo;
        photo.width = 150;
        photo.alt = "Item Photo";
        reportBox.appendChild(photo);
      }

      const fields = [
        ["Person Name", report.personName || "Not available"],
        ["Item Name", report.itemName || "Not available"],
        ["Category", report.category || "Not available"],
        ["Location", report.location || "Not available"],
        ["Date", report.date || "Not available"],
        ["Description", report.description || "Not available"],
        ["Contact", report.contact || "Not available"]
      ];

      fields.forEach(function ([label, value]) {
        const paragraph = document.createElement("p");
        const bold = document.createElement("b");

        bold.textContent = label + ": ";
        paragraph.appendChild(bold);
        paragraph.appendChild(document.createTextNode(value));

        reportBox.appendChild(paragraph);
      });

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-report-btn";
      deleteButton.textContent = "🗑️ Delete Report";
      deleteButton.dataset.id = report.id;
      deleteButton.dataset.type = report.type;

      reportBox.appendChild(deleteButton);
      myReports.appendChild(reportBox);
    });

    // Delete report
    document.querySelectorAll(".delete-report-btn").forEach(function (button) {
      button.addEventListener("click", async function () {
        const reportId = button.dataset.id;
        const reportType = button.dataset.type;

        const confirmDelete = confirm(
          "Are you sure you want to delete this report?"
        );

        if (!confirmDelete) return;

        button.disabled = true;
        button.textContent = "Deleting...";

        try {
          const collectionName =
            reportType === "Lost" ? "lostItems" : "foundItems";

          await deleteDoc(doc(db, collectionName, reportId));

          const reportCard = button.closest(".item-card");
          if (reportCard) {
            reportCard.remove();
          }

          alert("Report deleted successfully!");

          if (myReports.querySelectorAll(".item-card").length === 0) {
            myReports.innerHTML = `
              <h3>No Reports Found</h3>
              <p>You have not reported any lost or found item yet.</p>
            `;
          }
        } catch (error) {
          console.error("Delete error:", error);
          alert("Could not delete the report. Please try again.");

          button.disabled = false;
          button.textContent = "🗑️ Delete Report";
        }
      });
    });

  } catch (error) {
    console.error("Error loading reports:", error);
    myReports.innerHTML = `
      <p>Error loading your reports. Please refresh the page and try again.</p>
    `;
  }
}

// Check login status
onAuthStateChanged(auth, function (user) {
  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  loadMyReports(user);
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async function () {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed!");
    }
  });
}