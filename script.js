// ===================================
// THREE.JS BACKGROUND ANIMATION
// ===================================
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;

const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: 0x6366f1,
    transparent: true,
    opacity: 0.8,
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Create geometric shapes
const shapes = [];
const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.TetrahedronGeometry(1, 0),
];

for (let i = 0; i < 15; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x6366f1 : 0x06ffa5,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 10;
    mesh.position.y = (Math.random() - 0.5) * 10;
    mesh.position.z = (Math.random() - 0.5) * 10;
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.scale.setScalar(Math.random() * 0.5 + 0.5);
    
    shapes.push({
        mesh,
        rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
        },
        floatSpeed: Math.random() * 0.5 + 0.5,
        floatOffset: Math.random() * Math.PI * 2,
    });
    
    scene.add(mesh);
}

camera.position.z = 5;

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

// Scroll interaction
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();
    
    targetX = mouseX * 2;
    targetY = mouseY * 2;
    
    // Rotate particles
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
    particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
    
    // Animate shapes
    shapes.forEach((shape, index) => {
        shape.mesh.rotation.x += shape.rotationSpeed.x;
        shape.mesh.rotation.y += shape.rotationSpeed.y;
        
        // Floating animation
        shape.mesh.position.y += Math.sin(elapsedTime * shape.floatSpeed + shape.floatOffset) * 0.002;
    });
    
    // Camera movement on scroll
    camera.position.y = -scrollY * 0.002;
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===================================
// GSAP ANIMATIONS
// ===================================
gsap.registerPlugin(ScrollTrigger);

// Loading screen
window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            
            // Trigger hero animations after loading
            gsap.to('.hero-title', { opacity: 1, x: 0, duration: 1, ease: 'power3.out' });
        }, 500);
    }, 2000);
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    burger.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        burger.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

// Section titles animation
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
        scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
    });
});

// About section image animation
gsap.from('.image-wrapper', {
    scrollTrigger: {
        trigger: '.about-content',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    scale: 0.8,
    rotation: -10,
    duration: 1.2,
    ease: 'back.out(1.7)',
});

// About text animation
gsap.from('.about-text', {
    scrollTrigger: {
        trigger: '.about-content',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    x: 50,
    duration: 1,
    ease: 'power3.out',
    delay: 0.3,
});

// Stats counter animation
const statNumbers = document.querySelectorAll('.stat-number');

statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    
    ScrollTrigger.create({
        trigger: stat,
        start: 'top 85%',
        once: true,
        onEnter: () => {
            let count = 0;
            const increment = target / 100;
            
            const updateCount = () => {
                if (count < target) {
                    count += increment;
                    stat.textContent = Math.ceil(count);
                    setTimeout(updateCount, 20);
                } else {
                    stat.textContent = target + '+';
                }
            };
            
            updateCount();
        },
    });
});

// Skills animation
const skillItems = document.querySelectorAll('.skill-item');

skillItems.forEach((item, index) => {
    const level = item.getAttribute('data-level');
    const progress = item.querySelector('.skill-progress');
    
    ScrollTrigger.create({
        trigger: item,
        start: 'top 90%',
        once: true,
        onEnter: () => {
            gsap.to(item, {
                opacity: 1,
                x: 0,
                duration: 0.5,
                delay: index * 0.1,
            });
            
            gsap.to(progress, {
                width: `${level}%`,
                duration: 1.5,
                ease: 'power3.out',
                delay: 0.5,
            });
        },
    });
});

// Tech stack 3D animation
gsap.to('.orbit-system', {
    scrollTrigger: {
        trigger: '.tech-stack-3d',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
    },
    rotation: 360,
});

// Tech icons animation
gsap.utils.toArray('.tech-icon').forEach((icon, index) => {
    gsap.from(icon, {
        scrollTrigger: {
            trigger: '.tech-icons',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
        },
        opacity: 0,
        scale: 0,
        duration: 0.5,
        delay: index * 0.1,
        ease: 'back.out(1.7)',
    });
});

// Projects filter functionality
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.classList.add('show');
                }, 50);
            } else {
                card.classList.remove('show');
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Initial projects animation
ScrollTrigger.create({
    trigger: '.projects-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
        projectCards.forEach((card, index) => {
            gsap.to(card, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: index * 0.1,
                ease: 'power3.out',
                onComplete: () => {
                    card.classList.add('show');
                },
            });
        });
    },
});

// Contact form animation
gsap.from('.contact-info', {
    scrollTrigger: {
        trigger: '.contact-content',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    x: -50,
    duration: 1,
    ease: 'power3.out',
});

gsap.from('.contact-form', {
    scrollTrigger: {
        trigger: '.contact-content',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    x: 50,
    duration: 1,
    ease: 'power3.out',
    delay: 0.3,
});

// Form submission
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Show success message (in real app, you would send this to a server)
    alert(`¡Gracias ${name}! Tu mensaje ha sido enviado. Te contactaré pronto.`);
    
    // Reset form
    contactForm.reset();
});

// Cursor trail effect (optional enhancement)
const cursor = document.createElement('div');
cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid #06ffa5;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.1s ease;
    transform: translate(-50%, -50%);
    opacity: 0.5;
`;

document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power2.out',
    });
});

// Hover effect on interactive elements
const interactiveElements = document.querySelectorAll('a, button, .project-card, .tech-icon');

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(cursor, {
            scale: 1.5,
            duration: 0.3,
        });
    });
    
    el.addEventListener('mouseleave', () => {
        gsap.to(cursor, {
            scale: 1,
            duration: 0.3,
        });
    });
});

// Parallax effect for floating shapes
gsap.utils.toArray('.shape').forEach((shape, index) => {
    gsap.to(shape, {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        },
        y: index * 50,
        rotation: index * 30,
    });
});

// Button hover ripple effect
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('mouseenter', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: 100px;
            height: 100px;
            margin-left: -50px;
            margin-top: -50px;
        `;
        
        this.style.overflow = 'hidden';
        this.style.position = 'relative';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Console message for developers
console.log('%c👋 ¡Hola Developer!', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%c¿Te gusta lo que ves? El código está en GitHub', 'font-size: 14px; color: #06ffa5;');
console.log('%cPortfolio creado con ❤️ usando Three.js y GSAP', 'font-size: 12px; color: #a0a0b0;');
