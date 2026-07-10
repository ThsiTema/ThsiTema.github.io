document.documentElement.classList.add("js");

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach((link) => {
          link.toggleAttribute(
            "aria-current",
            link.getAttribute("href") === `#${entry.target.id}`,
          );
        });
      }
    },
    { rootMargin: "-25% 0px -65%", threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));
}
