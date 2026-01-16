// --- MAIN DOCUMENT READY LISTENER ---
document.addEventListener('DOMContentLoaded', function () {

    // --- VANTA.JS TOPOLOGY ANIMATION ---
    // Make sure to include p5.min.js and vanta.topology.min.js in your HTML
    const headerEl = document.querySelector('header');
    if (window.VANTA && headerEl) {
        VANTA.TOPOLOGY({
            el: headerEl,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0xc0ff,
            backgroundColor: 0x000000
        });
    }

    // --- SCROLL TO TOP BUTTON ---
    const scrollTopBtn = document.getElementById('scroll-to-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- UNIVERSAL FADE-IN ANIMATION ON SCROLL ---
    const animateOnScroll = (selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => { el.style.opacity = '0'; });
        const observer = new IntersectionObserver(entries => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `fadeInUp 0.8s ease forwards ${index * 0.2}s`;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        elements.forEach(el => { observer.observe(el); });
    };
    animateOnScroll('.project');
    animateOnScroll('.timeline-item');

    // --- TYPING ANIMATION ---
    const subtitleElement = document.getElementById('subtitle');
    if (subtitleElement) {
        const textToType = subtitleElement.innerText;
        const typingSpeed = 100;
        let charIndex = 0;
        subtitleElement.innerText = '';
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        const parent = subtitleElement.parentElement;
        if (parent) {
            parent.insertBefore(cursor, subtitleElement.nextSibling);
        }

        function type() {
            if (charIndex < textToType.length) {
                subtitleElement.textContent += textToType.charAt(charIndex);
                charIndex++;
                setTimeout(type, typingSpeed);
            }
        }
        setTimeout(type, 500);
    }
    const thumbnail = document.getElementById("demo-thumbnail");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".close");

    if (thumbnail && lightbox && lightboxImg && closeBtn) {
        thumbnail.addEventListener("click", () => {
            lightbox.style.display = "block";
            lightboxImg.src = thumbnail.src;
        });

        closeBtn.addEventListener("click", () => {
            lightbox.style.display = "none";
        });

        window.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
            }
        });
    }

});
