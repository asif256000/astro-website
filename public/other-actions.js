window.onload = function () {
  var ids = ["education", "experience", "projects", "certifications"];
  ids.forEach(function (id) {
    var wrapper = document.getElementById(id);
    if (wrapper) {
      var anchors = wrapper.getElementsByTagName("a");
      for (var i = 0; i < anchors.length; i++) {
        anchors[i].setAttribute("target", "_blank");
      }
    }
  });
};

document.addEventListener("DOMContentLoaded", function () {
  const allSelectedItems = document.querySelectorAll(".selected-item");

  // Toggle the navbar menu
  function toggleNavbar(event) {
    const selectedItem = event.target.closest(".selected-item");
    const navMenu = selectedItem.nextElementSibling;
    const isExpanded = navMenu.classList.toggle("active");

    if (isExpanded) {
      selectedItem.classList.add("expanded");
    } else {
      selectedItem.classList.remove("expanded");
    }
  }

  // Collapse all navbars when clicking outside
  document.addEventListener("click", function (event) {
    const allNavMenus = document.querySelectorAll("nav ul");
    let clickedInside = false;

    // Check if the click happened inside any nav
    allNavMenus.forEach((navMenu) => {
      if (navMenu.contains(event.target)) {
        clickedInside = true;
      }
    });

    allSelectedItems.forEach((selectedItem) => {
      if (selectedItem.contains(event.target)) {
        clickedInside = true;
      }
    });

    if (!clickedInside) {
      allNavMenus.forEach((navMenu) => {
        if (navMenu.classList.contains("active")) {
          navMenu.classList.remove("active");
          const associatedSelectedItem = navMenu
            .closest("nav")
            .querySelector(".selected-item");
          associatedSelectedItem.innerHTML =
            associatedSelectedItem.classList.remove("expanded");
        }
      });
    }
  });

  // Attach the toggleNavbar function to the selected items
  allSelectedItems.forEach((selectedItem) => {
    selectedItem.addEventListener("click", toggleNavbar);
  });
});
