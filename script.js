document.addEventListener('DOMContentLoaded', () => {
    const lockForm = document.getElementById('lock-form');
    const answerInput = document.getElementById('answer-input');
    const errorMsg = document.getElementById('error-msg');
    const lockScreen = document.getElementById('lock-screen');
    const letterScreen = document.getElementById('letter-screen');
    const envelope = document.getElementById('envelope');
    const openEnvelopeBtn = document.getElementById('open-envelope-btn');
    const envelopeWrapper = document.querySelector('.envelope-wrapper');
    const toSpideyBtn = document.getElementById('to-spidey-btn');
    const spideyScreen = document.getElementById('spidey-screen');
    const plannerScreen = document.getElementById('planner-screen');
    const toBlock4Btn = document.getElementById('to-block-4-btn');
    const bgCanvas = document.getElementById('bg-canvas');
    const ctx = bgCanvas ? bgCanvas.getContext('2d') : null;
    const plannerForm = document.getElementById('planner-form');
    const ticketWrapper = document.getElementById('ticket-wrapper');
    const generateTicketBtn = document.getElementById('generate-ticket-btn');
    const downloadTicketBtn = document.getElementById('download-ticket-btn');
    const ticketCard = document.getElementById('ticket-result');
    const ticketStatus = document.getElementById('ticket-status');
    const webCanvas = document.getElementById('spidey-web-canvas');
    const plannerCanvas = document.getElementById('planner-bg-canvas');
    let webCtx = webCanvas ? webCanvas.getContext('2d') : null;
    let plannerCtx = plannerCanvas ? plannerCanvas.getContext('2d') : null;

    const validKeywords = [
        'зал', 'спортзал', 'gym', 'active', 'актив',
        'active pro', 'актив про', 'активпро', 'activepro',
        'качалка', 'качалці', 'тренажерка', 'тренажерці',
        'тренажерний', 'треніровка', 'тренування', 'спорт',
        'fitness', 'fit'
    ];

    const setStatus = (node, message, isError = false) => {
        if (!node) return;
        node.textContent = message;
        node.style.color = isError ? '#ff6b81' : '#4cd137';
    };

    const setScreen = (activeScreen) => {
        const screens = [lockScreen, letterScreen, spideyScreen, plannerScreen].filter(Boolean);

        screens.forEach((screen) => {
            const isActive = screen === activeScreen;
            screen.classList.toggle('active', isActive);
            screen.classList.toggle('hidden', !isActive);
            screen.setAttribute('aria-hidden', String(!isActive));
        });

        if (bgCanvas) {
            const shouldShowBg = activeScreen === lockScreen || activeScreen === letterScreen;
            bgCanvas.classList.toggle('active', shouldShowBg);
        }
    };

    if (lockForm && answerInput && errorMsg && lockScreen && letterScreen) {
        lockForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const rawInput = answerInput.value ?? '';
            const normalizedInput = rawInput
                .toLowerCase()
                .trim()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

            const isCorrect = validKeywords.some((keyword) => normalizedInput.includes(keyword));

            if (isCorrect) {
                setStatus(errorMsg, 'Правильно! Відкриваю... ✨', false);

                setTimeout(() => {
                    setScreen(letterScreen);
                    resizeCanvas();
                }, 800);
            } else {
                setStatus(errorMsg, 'Хмм, здається, це було в іншому місці... Подумай ще 😉', true);
                answerInput.style.transform = 'translateX(-5px)';
                setTimeout(() => {
                    answerInput.style.transform = 'translateX(5px)';
                }, 100);
                setTimeout(() => {
                    answerInput.style.transform = 'translateX(0)';
                }, 200);
            }
        });
    }

    const openEnvelope = () => {
        if (!envelope || envelope.classList.contains('open')) return;
        envelope.classList.add('open');
        if (envelopeWrapper) {
            setTimeout(() => {
                envelopeWrapper.classList.add('opened');
            }, 300);
        }
    };

    if (openEnvelopeBtn) {
        openEnvelopeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            openEnvelope();
        });
    }

    if (envelope) {
        envelope.addEventListener('click', openEnvelope);
    }

    if (toSpideyBtn && letterScreen && spideyScreen) {
        toSpideyBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            setScreen(spideyScreen);
            resizeWebCanvas();
        });
    }

    if (toBlock4Btn && spideyScreen && plannerScreen) {
        toBlock4Btn.addEventListener('click', (event) => {
            event.stopPropagation();
            setScreen(plannerScreen);
            resizePlannerCanvas();
        });
    }

    if (generateTicketBtn && plannerForm && ticketWrapper) {
        generateTicketBtn.addEventListener('click', () => {
            const selectedLocation = document.querySelector('input[name="location"]:checked')?.value ?? '—';
            const selectedFood = document.querySelector('input[name="food"]:checked')?.value ?? '—';
            const resultLocation = document.getElementById('res-location');
            const resultFood = document.getElementById('res-food');

            if (resultLocation) resultLocation.textContent = selectedLocation;
            if (resultFood) resultFood.textContent = selectedFood;

            plannerForm.classList.add('hidden');
            plannerForm.setAttribute('aria-hidden', 'true');
            ticketWrapper.classList.remove('hidden');
            ticketWrapper.setAttribute('aria-hidden', 'false');
        });
    }

    if (downloadTicketBtn && ticketCard) {
        downloadTicketBtn.addEventListener('click', async () => {
            if (typeof window.html2canvas !== 'function') {
                if (ticketStatus) {
                    setStatus(ticketStatus, 'Експорт квитка тимчасово недоступний.', true);
                }
                return;
            }

            try {
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }

                const canvas = await window.html2canvas(ticketCard, {
                    backgroundColor: '#100a18',
                    scale: Math.min(window.devicePixelRatio || 1, 2)
                });

                if (ticketStatus) {
                    setStatus(ticketStatus, 'Квиток збережено.', false);
                }

                const link = document.createElement('a');
                link.download = 'Date-Ticket-Diana.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Помилка збереження:', error);
                if (ticketStatus) {
                    setStatus(ticketStatus, 'Не вдалося зберегти квиток. Спробуйте ще раз.', true);
                }
            }
        });
    }

    let width = 0;
    let height = 0;

    function resizeCanvas() {
        if (!bgCanvas || !ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = bgCanvas.getBoundingClientRect();
        width = rect.width || window.innerWidth;
        height = rect.height || window.innerHeight;

        bgCanvas.width = Math.round(width * dpr);
        bgCanvas.height = Math.round(height * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        resizeWebCanvas();
        resizePlannerCanvas();
    });

    resizeCanvas();

    const hearts = [];
    const heartCount = 40;

    class HeartLeaf {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = initial ? Math.random() * width : width * 0.4 + Math.random() * (width * 0.6);
            this.y = initial ? Math.random() * height : -20;
            this.size = Math.random() * 10 + 6;
            this.speedY = Math.random() * 1.2 + 0.5;
            this.speedX = -(Math.random() * 0.8 + 0.2);
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.03;
            this.opacity = Math.random() * 0.6 + 0.3;
            const colors = ['#e66496', '#f7d6e0', '#bd4870', '#e26992', '#ffffff'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5;
            this.rotation += this.rotSpeed;
            if (this.y > height + 20 || this.x < -20) this.reset();
        }

        draw() {
            if (!ctx) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const topCurveHeight = this.size * 0.3;
            ctx.moveTo(0, topCurveHeight);
            ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
            ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
            ctx.bezierCurveTo(0, this.size, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
            ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    function drawBranch(startX, startY, len, angle, branchWidth) {
        if (!ctx) return;
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = '#e66496';
        ctx.lineWidth = branchWidth;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.3;

        ctx.translate(startX, startY);
        ctx.rotate(angle * Math.PI / 180);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -len);
        ctx.stroke();

        if (len < 10) {
            ctx.restore();
            return;
        }

        drawBranch(0, -len, len * 0.78, 22, branchWidth * 0.7);
        drawBranch(0, -len, len * 0.78, -22, branchWidth * 0.7);

        ctx.restore();
    }

    function drawFullTree() {
        if (!ctx) return;
        const treeBaseX = width * 0.88;
        const treeBaseY = height;
        drawBranch(treeBaseX, treeBaseY, height * 0.24, -15, 8);
    }

    for (let i = 0; i < heartCount; i += 1) {
        hearts.push(new HeartLeaf());
    }

    function animateBackground() {
        if (!ctx || !letterScreen || letterScreen.classList.contains('hidden') || document.hidden) {
            requestAnimationFrame(animateBackground);
            return;
        }

        ctx.clearRect(0, 0, width, height);
        drawFullTree();
        hearts.forEach((heart) => {
            heart.update();
            heart.draw();
        });

        requestAnimationFrame(animateBackground);
    }

    animateBackground();

    let webWidth = 0;
    let webHeight = 0;
    let nodes = [];
    const nodeCount = 55;
    const maxDistance = 160;
    const mouse = { x: null, y: null, radius: 180 };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    function resizeWebCanvas() {
        if (!webCanvas || !webCtx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = webCanvas.getBoundingClientRect();
        webWidth = rect.width || window.innerWidth;
        webHeight = rect.height || window.innerHeight;

        webCanvas.width = Math.round(webWidth * dpr);
        webCanvas.height = Math.round(webHeight * dpr);
        webCtx.setTransform(1, 0, 0, 1, 0, 0);
        webCtx.scale(dpr, dpr);
    }

    resizeWebCanvas();

    class WebNode {
        constructor() {
            this.x = Math.random() * (webWidth || window.innerWidth);
            this.y = Math.random() * (webHeight || window.innerHeight);
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2 + 1.2;
            this.color = Math.random() > 0.35 ? '#ff2a5f' : '#00d2ff';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > webWidth) this.vx *= -1;
            if (this.y < 0 || this.y > webHeight) this.vy *= -1;

            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x -= (dx / dist) * force * 2.5;
                    this.y -= (dy / dist) * force * 2.5;
                }
            }
        }

        draw() {
            if (!webCtx) return;
            webCtx.save();
            webCtx.beginPath();
            webCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            webCtx.fillStyle = this.color;
            webCtx.shadowColor = this.color;
            webCtx.shadowBlur = 8;
            webCtx.fill();
            webCtx.restore();
        }
    }

    for (let i = 0; i < nodeCount; i += 1) {
        nodes.push(new WebNode());
    }

    function animateSpideyWeb() {
        if (!webCtx || !spideyScreen || spideyScreen.classList.contains('hidden') || document.hidden) {
            requestAnimationFrame(animateSpideyWeb);
            return;
        }

        webCtx.clearRect(0, 0, webWidth, webHeight);

        for (let i = 0; i < nodes.length; i += 1) {
            nodes[i].update();
            nodes[i].draw();

            for (let j = i + 1; j < nodes.length; j += 1) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDistance) {
                    const opacity = (1 - dist / maxDistance) * 0.45;
                    webCtx.save();
                    webCtx.beginPath();
                    webCtx.moveTo(nodes[i].x, nodes[i].y);
                    webCtx.lineTo(nodes[j].x, nodes[j].y);
                    webCtx.strokeStyle = `rgba(255, 42, 95, ${opacity})`;
                    webCtx.lineWidth = 0.8;
                    webCtx.stroke();
                    webCtx.restore();
                }
            }
        }

        requestAnimationFrame(animateSpideyWeb);
    }

    animateSpideyWeb();

    let pWidth = 0;
    let pHeight = 0;
    let stars = [];

    function resizePlannerCanvas() {
        if (!plannerCanvas || !plannerCtx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = plannerCanvas.getBoundingClientRect();
        pWidth = rect.width || window.innerWidth;
        pHeight = rect.height || window.innerHeight;

        plannerCanvas.width = Math.round(pWidth * dpr);
        plannerCanvas.height = Math.round(pHeight * dpr);
        plannerCtx.setTransform(1, 0, 0, 1, 0, 0);
        plannerCtx.scale(dpr, dpr);
    }

    resizePlannerCanvas();

    class StarParticle {
        constructor() {
            this.x = Math.random() * (pWidth || window.innerWidth);
            this.y = Math.random() * (pHeight || window.innerHeight);
            this.size = Math.random() * 2 + 0.5;
            this.alpha = Math.random() * 0.8 + 0.2;
            this.speedAlpha = (Math.random() - 0.5) * 0.015;
            this.color = Math.random() > 0.4 ? '#ff7597' : '#ffd700';
        }

        update() {
            this.alpha += this.speedAlpha;
            if (this.alpha <= 0.1 || this.alpha >= 0.9) this.speedAlpha *= -1;
        }

        draw() {
            if (!plannerCtx) return;
            plannerCtx.save();
            plannerCtx.globalAlpha = this.alpha;
            plannerCtx.fillStyle = this.color;
            plannerCtx.shadowColor = this.color;
            plannerCtx.shadowBlur = 6;
            plannerCtx.beginPath();
            plannerCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            plannerCtx.fill();
            plannerCtx.restore();
        }
    }

    for (let i = 0; i < 70; i += 1) {
        stars.push(new StarParticle());
    }

    function animatePlannerBg() {
        if (!plannerCtx || !plannerScreen || plannerScreen.classList.contains('hidden') || document.hidden) {
            requestAnimationFrame(animatePlannerBg);
            return;
        }

        plannerCtx.clearRect(0, 0, pWidth, pHeight);
        stars.forEach((star) => {
            star.update();
            star.draw();
        });

        requestAnimationFrame(animatePlannerBg);
    }

    animatePlannerBg();
});