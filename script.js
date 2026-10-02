document.addEventListener('DOMContentLoaded', () => {
    // Елементи екранів
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

    const validKeywords = [
        'зал', 'спортзал', 'gym', 'active', 'актив', 
        'active pro', 'актив про', 'активпро', 'activepro',
        'качалка', 'качалці', 'тренажерка', 'тренажерці', 
        'тренажерний', 'треніровка', 'тренування', 'спорт', 
        'fitness', 'fit'
    ];

    // 1. КОДОВИЙ ЗАМОК
    if (lockForm) {
        lockForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const rawInput = answerInput.value;
            const normalizedInput = rawInput
                .toLowerCase()
                .trim()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

            const isCorrect = validKeywords.some(keyword => normalizedInput.includes(keyword));

            if (isCorrect) {
                errorMsg.style.color = '#4cd137';
                errorMsg.textContent = 'Правильно! Відкриваю... ✨';
                
                setTimeout(() => {
                    lockScreen.classList.remove('active');
                    lockScreen.classList.add('hidden');
                    
                    letterScreen.classList.remove('hidden');
                    letterScreen.classList.add('active');

                    resizeCanvas();
                    bgCanvas.classList.add('active');
                }, 800);
            } else {
                errorMsg.style.color = '#ff6b81';
                errorMsg.textContent = 'Хмм, здається, це було в іншому місці... Подумай ще 😉';
                
                answerInput.style.transform = 'translateX(-5px)';
                setTimeout(() => answerInput.style.transform = 'translateX(5px)', 100);
                setTimeout(() => answerInput.style.transform = 'translateX(0)', 200);
            }
        });
    }

    // 2. ВІДКРИТТЯ КОНВЕРТА
    const openEnvelope = () => {
        if (envelope && !envelope.classList.contains('open')) {
            envelope.classList.add('open');
            setTimeout(() => {
                envelopeWrapper.classList.add('opened');
            }, 300);
        }
    };

    if (openEnvelopeBtn) openEnvelopeBtn.addEventListener('click', (e) => { e.stopPropagation(); openEnvelope(); });
    if (envelope) envelope.addEventListener('click', openEnvelope);

    // 3. ПЕРЕХІД ДО SPIDER-MAN (БЛОК 3)
    if (toSpideyBtn) {
        toSpideyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            letterScreen.classList.remove('active');
            letterScreen.classList.add('hidden');
            if (bgCanvas) bgCanvas.classList.remove('active');

            spideyScreen.classList.remove('hidden');
            spideyScreen.classList.add('active');

            resizeWebCanvas();
        });
    }

    // 4. ПЕРЕХІД З БЛОКУ 3 НА БЛОК 4 (ПЛАНУВАЛЬНИК)
    if (toBlock4Btn) {
        toBlock4Btn.addEventListener('click', (e) => {
            e.stopPropagation();
            spideyScreen.classList.remove('active');
            spideyScreen.classList.add('hidden');

            plannerScreen.classList.remove('hidden');
            plannerScreen.classList.add('active');

            resizePlannerCanvas();
        });
    }

    // 5. ГЕНЕРАЦІЯ КВИТКА У БЛОЦІ 4
    const generateTicketBtn = document.getElementById('generate-ticket-btn');
    const plannerForm = document.getElementById('planner-form');
    const ticketWrapper = document.getElementById('ticket-wrapper');

    if (generateTicketBtn) {
        generateTicketBtn.addEventListener('click', () => {
            const selectedLocation = document.querySelector('input[name="location"]:checked')?.value;
            const selectedFood = document.querySelector('input[name="food"]:checked')?.value;

            document.getElementById('res-location').textContent = selectedLocation;
            document.getElementById('res-food').textContent = selectedFood;

            plannerForm.classList.add('hidden');
            ticketWrapper.classList.remove('hidden');
        });
    }

    // 6. СКАНУВАННЯ КВИТКА ЯК КАРТИНКИ (html2canvas)
    const downloadTicketBtn = document.getElementById('download-ticket-btn');
    const ticketCard = document.getElementById('ticket-result');

    if (downloadTicketBtn && ticketCard) {
        downloadTicketBtn.addEventListener('click', () => {
            html2canvas(ticketCard, {
                backgroundColor: '#100a18',
                scale: 2
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'Date-Ticket-Diana.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => {
                console.error('Помилка збереження:', err);
            });
        });
    }

    // 7. CANVAS: ДЕРЕВО ТА СЕРДЕЧКА (БЛОКИ 1 і 2)
    let width, height;
    function resizeCanvas() {
        if (!bgCanvas) return;
        width = bgCanvas.width = window.innerWidth;
        height = bgCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const hearts = [];
    const heartCount = 40;

    class HeartLeaf {
        constructor() { this.reset(true); }
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

    for (let i = 0; i < heartCount; i++) hearts.push(new HeartLeaf());

    function animateBackground() {
        if (ctx && letterScreen && !letterScreen.classList.contains('hidden')) {
            ctx.clearRect(0, 0, width, height);
            drawFullTree();
            hearts.forEach(heart => { heart.update(); heart.draw(); });
        }
        requestAnimationFrame(animateBackground);
    }
    animateBackground();

    // ==========================================
    // 8. SPIDER-MAN ANIMATED WEB CANVAS (БЛОК 3)
    // ==========================================
    const webCanvas = document.getElementById('spidey-web-canvas');
    let webCtx = webCanvas ? webCanvas.getContext('2d') : null;
    let webWidth, webHeight;
    let nodes = [];
    const nodeCount = 55;
    const maxDistance = 160;
    const mouse = { x: null, y: null, radius: 180 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function resizeWebCanvas() {
        if (!webCanvas) return;
        webWidth = webCanvas.width = window.innerWidth;
        webHeight = webCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeWebCanvas);
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
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    let force = (mouse.radius - dist) / mouse.radius;
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

    for (let i = 0; i < nodeCount; i++) {
        nodes.push(new WebNode());
    }

    function animateSpideyWeb() {
        if (webCtx && spideyScreen && !spideyScreen.classList.contains('hidden')) {
            webCtx.clearRect(0, 0, webWidth, webHeight);

            for (let i = 0; i < nodes.length; i++) {
                nodes[i].update();
                nodes[i].draw();

                for (let j = i + 1; j < nodes.length; j++) {
                    let dx = nodes[i].x - nodes[j].x;
                    let dy = nodes[i].y - nodes[j].y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDistance) {
                        let opacity = (1 - dist / maxDistance) * 0.45;
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
        }
        requestAnimationFrame(animateSpideyWeb);
    }

    animateSpideyWeb();

    // ==========================================
    // 9. PLANNER BACKGROUND PARTICLES (БЛОК 4)
    // ==========================================
    const plannerCanvas = document.getElementById('planner-bg-canvas');
    let plannerCtx = plannerCanvas ? plannerCanvas.getContext('2d') : null;
    let pWidth, pHeight;
    let stars = [];

    function resizePlannerCanvas() {
        if (!plannerCanvas) return;
        pWidth = plannerCanvas.width = window.innerWidth;
        pHeight = plannerCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizePlannerCanvas);
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

    for (let i = 0; i < 70; i++) stars.push(new StarParticle());

    function animatePlannerBg() {
        if (plannerCtx && plannerScreen && !plannerScreen.classList.contains('hidden')) {
            plannerCtx.clearRect(0, 0, pWidth, pHeight);
            stars.forEach(star => { star.update(); star.draw(); });
        }
        requestAnimationFrame(animatePlannerBg);
    }

    animatePlannerBg();
});