document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lightbox
    initLightbox();

    // 2. Initialize Lazy Loading for Gallery Images
    initLazyLoading();
});

function initLightbox() {
    // Create Lightbox DOM elements
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox-modal';
    lightbox.className = 'lightbox-modal';

    lightbox.innerHTML = `
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-nav lightbox-prev">&lsaquo;</button>
        <div class="lightbox-content">
            <img src="" alt="" class="lightbox-image">
            <div class="lightbox-caption"></div>
        </div>
        <button class="lightbox-nav lightbox-next">&rsaquo;</button>
    `;

    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxContent = lightbox.querySelector('.lightbox-content');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    let currentGalleryItems = [];
    let currentIndex = 0;

    // Open Lightbox
    function openLightbox(items, index) {
        currentGalleryItems = items;
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Disable scroll
    }

    // Close Lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Enable scroll
    }

    // Update Content
    function updateLightboxContent() {
        const item = currentGalleryItems[currentIndex];
        const img = item.querySelector('img');

        let src = img.src;
        let alt = img.alt;

        const anchor = item.closest('a');
        if (anchor && anchor.href.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            src = anchor.href;
        } else if (item.dataset.fullSrc) {
            src = item.dataset.fullSrc;
        }

        lightboxImg.src = src;
        lightboxImg.alt = alt;

        const caption = img.title || img.alt || '';
        lightboxCaption.textContent = caption;
        lightboxCaption.style.display = caption ? 'block' : 'none';
    }

    // Navigation
    function showNext() {
        currentIndex = (currentIndex + 1) % currentGalleryItems.length;
        updateLightboxContent();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
        updateLightboxContent();
    }

    // Event Listeners for Lightbox Controls
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

    // Close on click outside
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });

    // Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxContent.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightboxContent.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const threshold = 50; // min distance for swipe
        if (touchEndX < touchStartX - threshold) {
            showNext();
        }
        if (touchEndX > touchStartX + threshold) {
            showPrev();
        }
    }

    // Attach Click Events to Gallery Items
    const setupGalleryEvents = () => {
        const galleries = document.querySelectorAll('.gallery-grid, .wp-block-gallery, .uagb-layout-grid');

        galleries.forEach(gallery => {
            const items = Array.from(gallery.querySelectorAll('.gallery-item, .wp-block-image, .uagb-layout-grid .wp-block-uagb-image'));

            items.forEach((item, index) => {
                const img = item.querySelector('img');
                if (!img) return;

                item.style.cursor = 'pointer';
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    openLightbox(items, index);
                });
            });
        });
    };

    setupGalleryEvents();
}

function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}
