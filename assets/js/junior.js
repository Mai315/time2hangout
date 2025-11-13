document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('js-enabled');

    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            console.error('Image failed to load:', this.src);
            if (this.parentElement.classList.contains('photo-item')) {
                this.style.display = 'none';
                if (!this.parentElement.querySelector('.image-error')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'image-error';
                    errorDiv.innerHTML = '<span>Image unavailable</span>';
                    this.parentElement.appendChild(errorDiv);
                }
            } else if (this.parentElement.classList.contains('header-logo')) {
                this.style.display = 'none';
            }
        });

        img.addEventListener('load', function () {
            console.log('Image loaded successfully:', this.src);
        });
    });

    initScrollAnimations();
    initJuniorNavigation();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

function initScrollAnimations() {
    if (typeof IntersectionObserver === 'undefined') {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    document.querySelectorAll('.fade-in').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('visible');
        }
    });
}

function initJuniorNavigation() {
    const menuButton = document.querySelector('.page-junior .btn-menu');
    const navigation = document.querySelector('.page-junior .site-nav');
    const navLinks = document.querySelectorAll('.page-junior .site-nav a');

    if (!menuButton || !navigation) {
        return;
    }

    const closeMenu = () => {
        navigation.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
    };

    menuButton.addEventListener('click', () => {
        const isOpen = navigation.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (navigation.classList.contains('is-open')) {
                closeMenu();
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });
}
