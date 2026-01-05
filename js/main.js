document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNavigation = document.querySelector('.main-navigation');

    if (menuToggle && mainNavigation) {
        menuToggle.addEventListener('click', function() {
            mainNavigation.classList.toggle('toggled');
            const isExpanded = mainNavigation.classList.contains('toggled');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Add active class to current menu item
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.main-navigation a');

    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
});
