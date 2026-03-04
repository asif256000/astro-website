var timeout;
window.onscroll = function () {
  clearTimeout(timeout);
  var darkModeToggle = document.querySelector(".dark-mode-toggle");
  var scrollToTopButton = document.querySelector("#scroll-to-top");
  var scrollToBottomButton = document.querySelector("#scroll-to-bottom");
  if (window.pageYOffset > 75) {
    darkModeToggle.style.opacity = "0.1";
    scrollToTopButton.style.opacity = "1";
    scrollToBottomButton.style.opacity = "1";
  } else {
    darkModeToggle.style.opacity = "1";
    scrollToTopButton.style.opacity = "0.1";
    scrollToBottomButton.style.opacity = "0.1";
  }
  timeout = setTimeout(function () {
    scrollToTopButton.style.opacity = "0.1";
    scrollToBottomButton.style.opacity = "0.1";
  }, 1000);
};
