/* New file for dashboard-specific functionality */

/* BEGIN Dashboard UI */

// Theme Toggle
const themeBtn = document.querySelector(".theme-btn")

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme")

    themeBtn.querySelector("span:nth-child(1)").classList.toggle("active")
    themeBtn.querySelector("span:nth-child(2)").classList.toggle("active")
  })
}

// Sidebar Toggle for Mobile
const menuBtn = document.querySelector("#menu-btn")
const closeBtn = document.querySelector("#close-btn")
const sidebar = document.querySelector("aside")

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    sidebar.style.left = "0"
  })
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    sidebar.style.left = "-100%"
  })
}

/* END Dashboard UI */
