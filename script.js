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
    const bgCanvas = document.getElementById('bg-canvas');
    const ctx = bgCanvas.getContext('2d');

    const validKeywords = [
        'зал', 'спортзал', 'gym', 'active', 'актив', 
        'active pro', 'актив про', 'активпро', 'activepro',
        'качалка', 'качалці', 'тренажерка', 'тренажерці', 
        'тренажерний', 'треніровка', 'тренування', 'спорт', 
        'fitness', 'fit'
    ];

    // 1. КОДОВИЙ ЗАМОК
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

                // Переконуємось у розмірах canvas при старті
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

    // 2. ВІДКРИТТЯ КОНВЕРТА
    const openEnvelope = () => {
        if (!envelope.classList.contains('open')) {
            envelope.classList.add('open');
            setTimeout(() => {
                envelopeWrapper.classList.add('opened');
            }, 300);
        }
    };

    openEnvelopeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope();
    });

    envelope.addEventListener('click', openEnvelope);

    // 3. ПЕРЕХІД ДО SPIDER-MAN
    toSpideyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        letterScreen.classList.remove('active');
        letterScreen.classList.add('hidden');
        bgCanvas.classList.remove('active');

        spideyScreen.classList.remove('hidden');
        spideyScreen.classList.add('active');
    });

    // 4. CANVAS: ДЕРЕВО ТА СЕРДЕЧКА
    let width, height;

    function resizeCanvas() {
        width = bgCanvas.width = window.innerWidth;
        height = bgCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Падаючі сердечка
    const hearts = [];
    const heartCount = 45;

    class HeartLeaf {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = initial ? Math.random() * width : width * 0.5 + Math.random() * (width * 0.5);
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

            if (this.y > height + 20 || this.x < -20) {
                this.reset();
            }
        }

        draw() {
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

    // Рекурсивне малювання гіллястого дерева праворуч
    function drawBranch(startX, startY, len, angle, branchWidth) {
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = '#e66496';
        ctx.lineWidth = branchWidth;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.25;

        ctx.translate(startX, startY);
        ctx.rotate(angle * Math.PI / 180);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -len);
        ctx.stroke();

        if (len < 10) {
            ctx.restore();
            return;
        }

        // Розгалуження на менші гілки
        drawBranch(0, -len, len * 0.78, 22, branchWidth * 0.7);
        drawBranch(0, -len, len * 0.78, -22, branchWidth * 0.7);

        ctx.restore();
    }

    function drawFullTree() {
        // Базовий стовбур у правому кутку
        const treeBaseX = width * 0.9;
        const treeBaseY = height;
        drawBranch(treeBaseX, treeBaseY, height * 0.22, -15, 8);
    }

    for (let i = 0; i < heartCount; i++) {
        hearts.push(new HeartLeaf());
    }

    function animateBackground() {
        ctx.clearRect(0, 0, width, height);
        
        drawFullTree();

        hearts.forEach(heart => {
            heart.update();
            heart.draw();
        });

        requestAnimationFrame(animateBackground);
    }

    animateBackground();
});