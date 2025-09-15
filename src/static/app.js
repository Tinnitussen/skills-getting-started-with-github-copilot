document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset activity select (keep the placeholder option)
      while (activitySelect.options.length > 1) {
        activitySelect.remove(1);
      }

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants HTML (bulleted list) or show a friendly placeholder
        let participantsHtml = "";
        if (Array.isArray(details.participants) && details.participants.length > 0) {
          participantsHtml = `<div class="participants-section">
              <h5>Participants</h5>
              <ul class="participants-list">
                ${details.participants.map(p => `<li class="participant-item">${p}</li>`).join("")}
              </ul>
            </div>`;
        } else {
          participantsHtml = `<div class="participants-section">
              <h5>Participants</h5>
              <p class="no-participants">No participants yet</p>
            </div>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p class="activity-desc">${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHtml}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById("email");
    const activityInput = document.getElementById("activity");
    // Normalize email to avoid case/whitespace duplicates
    const email = emailInput.value.trim().toLowerCase();
    const activity = activityInput.value;
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    // Simple client-side validation
    if (!email) {
      messageDiv.textContent = "Please enter a valid email.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      setTimeout(() => messageDiv.classList.add("hidden"), 3000);
      return;
    }

    submitBtn.disabled = true;
    messageDiv.textContent = "Signing up...";
    messageDiv.className = "info";
    messageDiv.classList.remove("hidden");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the participants list updates immediately
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Initialize app
  fetchActivities();
});
