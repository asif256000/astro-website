let darkMode = localStorage.getItem("darkMode");
const systemDarkMode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const darkModeToggle = document.getElementById("dark-mode-toggle");
const toggleText = document.getElementById("toggle-text");
const body = document.body;
const dark_mode_text = "Welcome to the dark side!&nbsp;&nbsp;&nbsp;";
const light_mode_text = "Come to the dark side...&nbsp;&nbsp;&nbsp;";

const enableDarkMode = () => {
  // 1. Add the class to the body
  body.classList.add("dark-mode");
  // 2. Update darkMode in localStorage
  localStorage.setItem("darkMode", "enabled");
  // 3. Make the toggle switch checked
  darkModeToggle.checked = true;
  // 4. Update the toggle text
  toggleText.innerHTML = dark_mode_text;
};

const disableDarkMode = () => {
  // 1. Remove the class from the body
  body.classList.remove("dark-mode");
  // 2. Update darkMode in localStorage
  localStorage.setItem("darkMode", "disabled");
  // 3. Make the toggle switch unchecked
  darkModeToggle.checked = false;
  // 4. Update the toggle text
  toggleText.innerHTML = light_mode_text;
};

// If the user already visited and enabled darkMode
if (darkMode === "enabled") {
  enableDarkMode();
} else if (darkMode === "disabled") {
  disableDarkMode();
  // Check if user has a preferred color scheme
} else if (systemDarkMode) {
  enableDarkMode();
} else {
  disableDarkMode();
}

darkModeToggle.addEventListener("click", () => {
  darkMode = localStorage.getItem("darkMode");

  if (darkMode === "enabled") {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
});
