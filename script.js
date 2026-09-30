const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function setCurrentSection(id) {
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

// The page and anchor navigation work with JavaScript disabled.
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setCurrentSection(entry.target.id);
      }
    },
    { rootMargin: "-20% 0px -60%", threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));
}
