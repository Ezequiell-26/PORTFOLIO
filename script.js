/**
 * MATÍAS EZEQUIEL GONZÁLEZ - PORTFOLIO
 * JavaScript Profesional Optimizado
 */

'use strict';

// ========================================
// CONFIGURACIÓN & UTILIDADES
// ========================================

const CONFIG = {
    threejs: {
        particleCount: 800, // Reducido para mejor performance
        shapeCount: 8,
        particleSize: 0.004,
        cameraZ: 5,
    },
    animation: {
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
    },
    scroll: {
        threshold: 100,
    },
};

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Check if device is mobile/touch
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ========================================
// THREE.JS BACKGROUND OPTIMIZADO
// ========================================

class BackgroundAnimation {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: false, // Mejor performance
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limitar pixel ratio

        // Create particles
        this.createParticles();

        // Create geometric shapes (solo si no hay reduced motion)
        if (!prefersReducedMotion && !isTouchDevice) {
            this.createShapes();
        }

        // Camera position
        this.camera.position.z = CONFIG.threejs.cameraZ;

        // Event listeners
        this.setupEventListeners();

        // Start animation loop
        this.clock = new THREE.Clock();
        this.animate();
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.threejs.particleCount * 3);

        for (let i = 0; i < CONFIG.threejs.particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 15;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: CONFIG.threejs.particleSize,
            color: 0x6366f1,
            transparent: true,
            opacity: 0.6,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createShapes() {
        this.shapes = [];
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
        ];

        for (let i = 0; i < CONFIG.threejs.shapeCount; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x6366f1 : 0x22d3ee,
                wireframe: true,
                transparent: true,
                opacity: 0.15,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            mesh.scale.setScalar(Math.random() * 0.5 + 0.5);

            this.shapes.push({
                mesh,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: (Math.random() - 0.5) * 0.01,
                },
            });

            this.scene.add(mesh);
        }
    }

    setupEventListeners() {
        // Resize handler con debounce
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));

        // Mouse movement (solo desktop)
        if (!isTouchDevice) {
            document.addEventListener('mousemove', throttle((e) => {
                this.handleMouseMove(e);
            }, 100));
        }
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    handleMouseMove(event) {
        const mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
        const mouseY = (event.clientY - window.innerHeight / 2) * 0.001;

        if (this.particles) {
            this.particles.rotation.y += mouseX * 0.05;
            this.particles.rotation.x += mouseY * 0.05;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();

        // Rotación suave de partículas
        if (this.particles) {
            this.particles.rotation.y = elapsedTime * 0.03;
        }

        // Animación de formas (solo si existen y no hay reduced motion)
        if (this.shapes && !prefersReducedMotion) {
            this.shapes.forEach((shape) => {
                shape.mesh.rotation.x += shape.rotationSpeed.x;
                shape.mesh.rotation.y += shape.rotationSpeed.y;
            });
        }

        this.renderer.render(this.scene, this.camera);
    }

    // Cleanup para memory leaks
    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
        if (this.shapes) {
            this.shapes.forEach((shape) => {
                shape.mesh.geometry.dispose();
                shape.mesh.material.dispose();
            });
        }
    }
}

// ========================================
// NAVBAR & NAVEGACIÓN
// ========================================

class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.burger = document.querySelector('.burger');
        this.navLinks = document.querySelector('.nav-links');
        this.links = document.querySelectorAll('.nav-link');

        this.init();
    }

    init() {
        this.setupScrollListener();
        this.setupMobileMenu();
        this.setupActiveLink();
        this.setupSmoothScroll();
    }

    setupScrollListener() {
        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > CONFIG.scroll.threshold) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }, 100));
    }

    setupMobileMenu() {
        if (!this.burger) return;

        this.burger.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Cerrar menú al hacer click en un link
        this.links.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (this.navLinks.classList.contains('active') &&
                !this.navLinks.contains(e.target) &&
                !this.burger.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Prevenir scroll cuando el menú está abierto
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    document.body.style.overflow = this.navLinks.classList.contains('active') ? 'hidden' : '';
                }
            });
        });

        observer.observe(this.navLinks, { attributes: true });
    }

    toggleMobileMenu() {
        this.navLinks.classList.toggle('active');
        this.burger.classList.toggle('active');
    }

    closeMobileMenu() {
        this.navLinks.classList.remove('active');
        this.burger.classList.remove('active');
    }

    setupActiveLink() {
        const sections = document.querySelectorAll('section[id]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    this.updateActiveLink(id);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-100px 0px -100px 0px',
        });

        sections.forEach(section => observer.observe(section));
    }

    updateActiveLink(id) {
        this.links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
            }
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: prefersReducedMotion ? 'auto' : 'smooth',
                    });
                }
            });
        });
    }
}

// ========================================
// ANIMACIONES CON GSAP
// ========================================

class Animations {
    constructor() {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP no está disponible');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);
        this.init();
    }

    init() {
        if (prefersReducedMotion) {
            this.setupMinimalAnimations();
            return;
        }

        this.setupHeroAnimations();
        this.setupSectionAnimations();
        this.setupProjectAnimations();
        this.setupTimelineAnimations();
    }

    setupMinimalAnimations() {
        // Solo fade-in básico para accesibilidad
        gsap.utils.toArray('.section').forEach(section => {
            gsap.from(section, {
                opacity: 0,
                duration: 0.3,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 90%',
                    once: true,
                },
            });
        });
    }

    setupHeroAnimations() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.hero-badge', {
            opacity: 0,
            y: 20,
            duration: 0.5,
        })
        .from('.hero-title', {
            opacity: 0,
            y: 30,
            duration: 0.8,
        }, '-=0.3')
        .from('.hero-subtitle', {
            opacity: 0,
            y: 20,
            duration: 0.6,
        }, '-=0.4')
        .from('.hero-description', {
            opacity: 0,
            y: 20,
            duration: 0.6,
        }, '-=0.4')
        .from('.cta-buttons .btn', {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.5,
        }, '-=0.3')
        .from('.tech-indicators', {
            opacity: 0,
            y: 20,
            duration: 0.5,
        }, '-=0.3')
        .from('.code-block', {
            opacity: 0,
            x: 50,
            rotationY: -15,
            duration: 1,
        }, '-=0.6');
    }

    setupSectionAnimations() {
        // Títulos de sección
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                opacity: 0,
                y: 40,
                duration: 0.8,
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                    once: true,
                },
            });
        });

        // About section
        gsap.from('.about-content > div', {
            opacity: 0,
            y: 50,
            stagger: 0.2,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.about-content',
                start: 'top 80%',
                once: true,
            },
        });

        // Stack categories
        gsap.from('.stack-category', {
            opacity: 0,
            y: 40,
            stagger: 0.1,
            duration: 0.6,
            scrollTrigger: {
                trigger: '.stack-grid',
                start: 'top 80%',
                once: true,
            },
        });
    }

    setupProjectAnimations() {
        // Featured project
        gsap.from('.featured-project', {
            opacity: 0,
            y: 50,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.featured-project',
                start: 'top 85%',
                once: true,
            },
        });

        // Project cards
        gsap.from('.project-card', {
            opacity: 0,
            y: 40,
            stagger: 0.1,
            duration: 0.6,
            scrollTrigger: {
                trigger: '.projects-grid',
                start: 'top 85%',
                once: true,
            },
        });
    }

    setupTimelineAnimations() {
        gsap.from('.timeline-item', {
            opacity: 0,
            x: -30,
            stagger: 0.15,
            duration: 0.7,
            scrollTrigger: {
                trigger: '.timeline',
                start: 'top 80%',
                once: true,
            },
        });
    }
}

// ========================================
// FORMULARIO DE CONTACTO
// ========================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.statusEl = document.querySelector('.form-status');

        if (!this.form) return;

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        // Validación básica
        if (!this.validateForm(data)) {
            return;
        }

        this.setLoading(true);

        try {
            // Enviar a Formspree
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                this.showSuccess();
                this.form.reset();
            } else {
                throw new Error('Error al enviar');
            }
        } catch (error) {
            this.showError();
        } finally {
            this.setLoading(false);
        }
    }

    validateForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            this.showStatus('Por favor ingresa tu nombre', 'error');
            return false;
        }

        if (!data.email || !this.isValidEmail(data.email)) {
            this.showStatus('Por favor ingresa un email válido', 'error');
            return false;
        }

        if (!data.message || data.message.trim().length < 10) {
            this.showStatus('Por favor ingresa un mensaje (mínimo 10 caracteres)', 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Enviando...</span>';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<span>Enviar mensaje</span><i class="fas fa-paper-plane"></i>';
        }
    }

    showSuccess() {
        this.showStatus('¡Mensaje enviado! Te contactaré pronto.', 'success');
    }

    showError() {
        this.showStatus('Hubo un error. Por favor intenta nuevamente o envía un email directo.', 'error');
    }

    showStatus(message, type) {
        this.statusEl.textContent = message;
        this.statusEl.className = `form-status ${type}`;

        setTimeout(() => {
            this.statusEl.textContent = '';
            this.statusEl.className = 'form-status';
        }, 5000);
    }
}

// ========================================
// FOOTER - AÑO DINÁMICO
// ========================================

class Footer {
    constructor() {
        this.yearEl = document.getElementById('currentYear');
        if (this.yearEl) {
            this.yearEl.textContent = new Date().getFullYear();
        }
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar componentes
    const bgAnimation = new BackgroundAnimation();
    const navigation = new Navigation();
    const animations = new Animations();
    const contactForm = new ContactForm();
    const footer = new Footer();

    // Log para developers
    console.log(
        '%c👋 Matías Ezequiel González - Portfolio',
        'font-size: 16px; font-weight: bold; color: #6366f1;'
    );
    console.log(
        '%cFull-Stack Developer · AI Product Builder',
        'font-size: 12px; color: #94a3b8;'
    );
    console.log(
        '%cConstruido con HTML, CSS, JavaScript, Three.js y GSAP',
        'font-size: 11px; color: #64748b;'
    );

    // Cleanup en unload
    window.addEventListener('beforeunload', () => {
        bgAnimation.destroy();
    });
});
