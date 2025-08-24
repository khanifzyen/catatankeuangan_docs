// script.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Logika untuk Overflow Menu ---
  const menuTrigger = document.getElementById("menu-trigger");
  const overflowMenu = document.getElementById("overflow-menu");
  const scrim = document.getElementById("scrim");

  const toggleMenu = (event) => {
    if (event) event.stopPropagation();
    overflowMenu.classList.toggle("active");
    scrim.classList.toggle("active");
  };

  if (menuTrigger && overflowMenu && scrim) {
    menuTrigger.addEventListener("click", toggleMenu);
    scrim.addEventListener("click", toggleMenu);
  }

  // --- 2. Logika untuk Semua Sistem Tab Berbasis 'data-target' ---
  const handleTabClick = (event) => {
    event.preventDefault();
    const clickedTab = event.currentTarget;
    const tabGroup = clickedTab.closest(".js-tab-group");
    if (!tabGroup) return;

    const targetContentId = clickedTab.getAttribute("data-target");
    const targetContent = document.getElementById(targetContentId);

    // Nonaktifkan semua tab di grup ini
    tabGroup
      .querySelectorAll("a")
      .forEach((tab) => tab.classList.remove("active"));

    // Sembunyikan semua konten yang terkait dengan grup ini (jika ada)
    if (targetContent) {
      const contentContainer = targetContent.parentElement;
      contentContainer
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));
      targetContent.classList.add("active");
    }

    // Aktifkan tab yang diklik
    clickedTab.classList.add("active");

    // Logika khusus untuk header dashboard
    if (tabGroup.matches(".time-nav-tabs")) {
      const periodNav = document.getElementById("header-period-nav");
      const staticTitle = document.getElementById("header-title-static");
      if (!periodNav || !staticTitle) return;

      if (clickedTab.getAttribute("data-view") === "total") {
        periodNav.classList.add("hidden");
        staticTitle.classList.remove("hidden");
      } else {
        const newPeriodText = clickedTab.getAttribute("data-period");
        const periodDisplayText = document.getElementById(
          "period-display-text"
        );
        periodNav.classList.remove("hidden");
        staticTitle.classList.add("hidden");
        if (periodDisplayText) periodDisplayText.textContent = newPeriodText;
      }
    }
  };

  // Terapkan event listener ke semua grup tab
  document.querySelectorAll(".js-tab-group a").forEach((tab) => {
    tab.addEventListener("click", handleTabClick);
  });

  // --- 3. Aktivasi Tab Default Saat Halaman Dimuat ---
  document.querySelectorAll(".js-tab-group").forEach((tabGroup) => {
    const defaultTab = tabGroup.querySelector("a");
    if (defaultTab) {
      defaultTab.click();
    }
  });
});
