document.addEventListener("DOMContentLoaded", function() {
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');

    const scrollHandler = () => {
        elementsToAnimate.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                element.classList.add('scroll-in-view');
            } else {
                element.classList.remove('scroll-in-view');
            }
        });
    };

    window.addEventListener('scroll', scrollHandler);
    scrollHandler(); // Trigger the function on page load
});
