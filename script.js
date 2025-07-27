
// script.js

// Form submission
const form = document.getElementById("vendorForm");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const alertBox = document.getElementById("alertBox");
    alertBox.classList.add("hidden");
    alertBox.textContent = "";
    alertBox.classList.remove("text-green-600", "text-red-600");

    const formData = new FormData(form);

    fetch("https://vendorkart.onrender.com", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.error || "Something went wrong during registration.");
          });
        }
        return response.json();
      })
      .then((data) => {
        alertBox.classList.add("text-green-600");
        alertBox.textContent = "✅ Registration successful!";
        alertBox.classList.remove("hidden");
        form.reset();
      })
      .catch((error) => {
        alertBox.classList.add("text-red-600");
        alertBox.textContent = "❌ " + error.message;
        alertBox.classList.remove("hidden");
      });
  });
}
