document.addEventListener('DOMContentLoaded', () => {

    // 1. PRELOADER
    const preloader = document.getElementById('preloader');
    setTimeout(() => { preloader.classList.add('hidden'); }, 2000);

    // 2. CUSTOM CURSOR
    const cursorBubble = document.getElementById('cursorBubble');
    const cursorDot = document.getElementById('cursorDot');
    let mouseX = 0, mouseY = 0, bubbleX = 0, bubbleY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    function animateCursor() {
        bubbleX += (mouseX - bubbleX) * 0.15;
        bubbleY += (mouseY - bubbleY) * 0.15;
        cursorBubble.style.left = bubbleX + 'px';
        cursorBubble.style.top = bubbleY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverElements = document.querySelectorAll('a, button, .achievement-card, .kanban-card, .tech-card, .showcase-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorBubble.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorBubble.classList.remove('hover'));
    });

    // 3. 3D ФОН С ПУЗЫРЯМИ
    initThreeJS();

    function initThreeJS() {
        const canvas = document.getElementById('bg3d');
        if (!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const bubbles = [];
        const bubbleGeometry = new THREE.SphereGeometry(1, 32, 32);

        for (let i = 0; i < 60; i++) {
            const material = new THREE.MeshPhysicalMaterial({
                color: 0x88ccdd,
                transparent: true,
                opacity: 0.4,
                roughness: 0.05,
                metalness: 0.1,
                transmission: 0.95,
                thickness: 0.8,
                clearcoat: 1,
                clearcoatRoughness: 0.1
            });

            const bubble = new THREE.Mesh(bubbleGeometry, material);
            bubble.position.x = (Math.random() - 0.5) * 35;
            bubble.position.y = (Math.random() - 0.5) * 35;
            bubble.position.z = (Math.random() - 0.5) * 20 - 5;

            const scale = Math.random() * 1.2 + 0.3;
            bubble.scale.set(scale, scale, scale);

            bubble.userData = {
                speed: Math.random() * 0.015 + 0.005,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.02 + 0.01
            };

            scene.add(bubble);
            bubbles.push(bubble);
        }

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const pointLight = new THREE.PointLight(0x4A90A4, 2, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);
        const pointLight2 = new THREE.PointLight(0xffffff, 1.5, 100);
        pointLight2.position.set(-10, -10, 5);
        scene.add(pointLight2);

        camera.position.z = 12;
        camera.position.y = 2;

        let scrollY = 0;
        window.addEventListener('scroll', () => { scrollY = window.scrollY; });

        function animate() {
            requestAnimationFrame(animate);
            bubbles.forEach(bubble => {
                bubble.position.y += bubble.userData.speed;
                bubble.userData.wobble += bubble.userData.wobbleSpeed;
                bubble.position.x += Math.sin(bubble.userData.wobble) * 0.015;
                if (bubble.position.y > 20) {
                    bubble.position.y = -20;
                    bubble.position.x = (Math.random() - 0.5) * 35;
                }
            });
            camera.position.y = 2 - (scrollY * 0.002);
            camera.position.x = (mouseX / window.innerWidth - 0.5) * 3;
            camera.lookAt(0, -scrollY * 0.002, 0);
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // 4. NAVIGATION
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) nav.classList.add('is-scrolled');
        else nav.classList.remove('is-scrolled');
    });

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) current = section.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) link.classList.add('active');
        });
    });

    // 5. AOS ANIMATIONS
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('aos-animate'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

    // 6. ОБЪЁМНЫЕ КАРТОЧКИ (3D tilt)
    document.querySelectorAll('.achievement-card').forEach(card => {
        let rafId = null;
        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
        function loop() {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            card.style.transform = `translateY(${currentX * 8}px) rotateX(${-currentY * 8}deg) rotateY(${currentX * 8}deg)`;
            if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
                rafId = requestAnimationFrame(loop);
            } else { rafId = null; }
        }
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            targetX = (e.clientX - rect.left) / rect.width - 0.5;
            targetY = (e.clientY - rect.top) / rect.height - 0.5;
            if (!rafId) rafId = requestAnimationFrame(loop);
        });
        card.addEventListener('mouseleave', () => {
            targetX = 0; targetY = 0;
            if (!rafId) rafId = requestAnimationFrame(loop);
        });
    });

    // 7. ТЕХНОЛОГИИ: лёгкий 3D-tilt + подсветка под курсором
    document.querySelectorAll('.tech-card').forEach(card => {
        let rafId = null;
        let tx = 0, ty = 0, cx = 0, cy = 0;
        function loop() {
            cx += (tx - cx) * 0.1;
            cy += (ty - cy) * 0.1;
            card.style.transform = `translateY(-8px) rotateX(${-cy * 4}deg) rotateY(${cx * 4}deg) scale(1.01)`;
            if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
                rafId = requestAnimationFrame(loop);
            } else { rafId = null; }
        }
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
            tx = (e.clientX - r.left) / r.width - 0.5;
            ty = (e.clientY - r.top) / r.height - 0.5;
            if (!rafId) rafId = requestAnimationFrame(loop);
        });
        card.addEventListener('mouseleave', () => {
            tx = 0; ty = 0;
            if (!rafId) rafId = requestAnimationFrame(loop);
        });
    });

    // 8. КАНБАН: drag-and-drop + click-перелёт
    const kanbanColumns = document.querySelectorAll('.kanban-column');
    const allKanbanCards = document.querySelectorAll('.kanban-card');
    let hasAnimatedKanban = false;
    let isFlying = false;

    function updateKanbanCounts() {
        document.querySelectorAll('.kanban-column').forEach(col => {
            const count = col.querySelectorAll('.kanban-card').length;
            col.querySelector('.kanban-count').textContent = count;
        });
    }

    function nextColumnOf(col) {
        const t = col.dataset.column;
        const nextType = t === 'todo' ? 'progress' : t === 'progress' ? 'done' : 'todo';
        return document.querySelector(`.kanban-column[data-column="${nextType}"]`);
    }

    function moveCardToNextColumn(card) {
        if (isFlying) return;
        const currentColumn = card.closest('.kanban-column');
        const nextColumn = nextColumnOf(currentColumn);
        if (!nextColumn) return;
        isFlying = true;

        const rect = card.getBoundingClientRect();
        const targetRect = nextColumn.querySelector('.kanban-cards').getBoundingClientRect();

        card.style.position = 'fixed';
        card.style.left = rect.left + 'px';
        card.style.top = rect.top + 'px';
        card.style.width = rect.width + 'px';
        card.style.height = rect.height + 'px';
        card.style.margin = '0';
        card.style.zIndex = '99999';
        card.style.pointerEvents = 'none';
        card.style.transition = 'none';
        card.style.transform = 'translate(0,0) scale(1) rotateZ(0deg)';

        requestAnimationFrame(() => {
            card.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s ease';
            card.style.transform = `translate(${targetRect.left - rect.left}px, ${targetRect.top - rect.top}px) scale(0.92) rotateZ(${(Math.random() - 0.5) * 8}deg)`;
            card.style.opacity = '0.6';
        });

        setTimeout(() => {
            card.style.cssText = '';
            nextColumn.querySelector('.kanban-cards').appendChild(card);
            updateKanbanCounts();
            requestAnimationFrame(() => {
                card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                setTimeout(() => { card.style.cssText = ''; isFlying = false; }, 360);
            });
        }, 720);
    }

    let draggedCard = null;

    allKanbanCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.dataset.justDragged === 'true') { card.dataset.justDragged = 'false'; return; }
            moveCardToNextColumn(card);
        });

        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });

        card.addEventListener('dragstart', (e) => {
            draggedCard = card;
            card.classList.add('dragging');
            card.dataset.justDragged = 'true';
            e.dataTransfer.effectAllowed = 'move';
            try { e.dataTransfer.setData('text/plain', card.dataset.task || 'task'); } catch (_) {}
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            draggedCard = null;
            document.querySelectorAll('.kanban-column.drag-over').forEach(c => c.classList.remove('drag-over'));
            setTimeout(() => { card.dataset.justDragged = 'false'; }, 50);
        });
    });

    kanbanColumns.forEach(col => {
        const cardsContainer = col.querySelector('.kanban-cards');

        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            col.classList.add('drag-over');
        });
        col.addEventListener('dragleave', (e) => {
            if (!col.contains(e.relatedTarget)) col.classList.remove('drag-over');
        });
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            if (draggedCard && cardsContainer) {
                cardsContainer.appendChild(draggedCard);
                updateKanbanCounts();
                draggedCard.classList.remove('dragging');
            }
        });

        if (cardsContainer) {
            cardsContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!draggedCard) return;
                const after = getDragAfterElement(cardsContainer, e.clientY);
                if (after == null) cardsContainer.appendChild(draggedCard);
                else cardsContainer.insertBefore(draggedCard, after);
            });
        }
    });

    function getDragAfterElement(container, y) {
        const elements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
        return elements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) return { offset, element: child };
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element || null;
    }

    const kanbanBoard = document.querySelector('.kanban-board');
    const kanbanObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimatedKanban) {
                hasAnimatedKanban = true;
                const todoCards = document.querySelectorAll('.kanban-column[data-column="todo"] .kanban-card');
                todoCards.forEach((card, index) => {
                    setTimeout(() => moveCardToNextColumn(card), index * 900);
                });
            }
        });
    }, { threshold: 0.5 });
    if (kanbanBoard) kanbanObserver.observe(kanbanBoard);

    // 9. MAGNETIC BUTTONS & SMOOTH SCROLL
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0, 0)'; });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // 10. TYPING EFFECT
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const text = tagline.textContent.trim().replace(/\s+/g, ' ');
        tagline.textContent = '';
        tagline.style.opacity = '1';
        let i = 0;
        setTimeout(() => {
            const typeInterval = setInterval(() => {
                if (i < text.length) { tagline.textContent += text.charAt(i); i++; }
                else { clearInterval(typeInterval); }
            }, 30);
        }, 1000);
    }

    // 11. ИНТЕРАКТИВНАЯ ВИЗИТКА
    const businessCard = document.getElementById('businessCard');
    let cardRotX = 0, cardRotY = 0;
    let targetCardRotX = 0, targetCardRotY = 0;
    let isCardDragging = false;
    let hasDragged = false;
    let cardStartX = 0, cardStartY = 0;
    let cardAnimId = null;

    if (businessCard) {
        const flipEl = () => businessCard.classList.contains('is-flipped') ? 180 : 0;

        function animateCard() {
            cardRotX += (targetCardRotX - cardRotX) * 0.15;
            cardRotY += (targetCardRotY - cardRotY) * 0.15;
            businessCard.style.transform = `rotateX(${cardRotX}deg) rotateY(${cardRotY + flipEl()}deg)`;
            if (Math.abs(cardRotX - targetCardRotX) < 0.05 && Math.abs(cardRotY - targetCardRotY) < 0.05) {
                cardAnimId = null; return;
            }
            cardAnimId = requestAnimationFrame(animateCard);
        }
        function kick() {
            if (cardAnimId) cancelAnimationFrame(cardAnimId);
            cardAnimId = requestAnimationFrame(animateCard);
        }

        businessCard.addEventListener('mousedown', (e) => {
            if (e.target.closest('a')) return;
            isCardDragging = true; hasDragged = false;
            cardStartX = e.clientX; cardStartY = e.clientY;
            businessCard.style.transition = 'none';
            businessCard.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isCardDragging) return;
            const deltaX = e.clientX - cardStartX;
            const deltaY = e.clientY - cardStartY;
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) hasDragged = true;
            targetCardRotY = deltaX * 0.8;
            targetCardRotX = -deltaY * 0.8;
            kick();
        });

        window.addEventListener('mouseup', () => {
            if (!isCardDragging) return;
            isCardDragging = false;
            businessCard.style.cursor = 'grab';
            businessCard.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
            targetCardRotX = 0; targetCardRotY = 0;
            cardRotX = 0; cardRotY = 0;
            businessCard.style.transform = `rotateX(0deg) rotateY(${flipEl()}deg)`;
        });

        businessCard.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            if (hasDragged) { hasDragged = false; return; }
            businessCard.classList.toggle('is-flipped');
            businessCard.style.transition = 'transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)';
            businessCard.style.transform = `rotateX(0deg) rotateY(${flipEl()}deg)`;
        });
    }

});