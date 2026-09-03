(() => {
    document.documentElement.classList.add('js');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const PHOTOS = { 1: '1.jpg', 2: '2.webp', 3: '3.webp', 4: '4.jpg' };

    const portrait = document.getElementById('portrait');
    const switchBtns = Array.from(document.querySelectorAll('.switch-btn'));
    let currentPhoto = '2';

    // split ascii art into lines for the dot-matrix print animation
    document.querySelectorAll('pre.ascii').forEach((pre) => {
        const lines = pre.textContent.replace(/\n$/, '').split('\n');
        pre.textContent = '';
        pre._lines = lines.map((ln) => {
            const s = document.createElement('span');
            s.className = 'ascii-line';
            s.textContent = ln;
            pre.appendChild(s);
            pre.appendChild(document.createTextNode('\n'));
            return s;
        });
    });

    const printAscii = (pre) => {
        const spans = pre._lines || [];
        if (reduced || spans.length === 0) {
            spans.forEach((s) => s.classList.add('on'));
            return;
        }
        let i = 0;
        const t = setInterval(() => {
            if (i < spans.length) {
                spans[i].classList.add('on');
                i++;
            } else {
                clearInterval(t);
            }
        }, 24);
    };

    // photo switcher
    const realImg = document.querySelector('.portrait__real');

    const switchPhoto = (n) => {
        if (n === currentPhoto || !PHOTOS[n]) return;
        currentPhoto = n;

        switchBtns.forEach((b) => {
            const active = b.dataset.photo === n;
            b.classList.toggle('is-active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        if (realImg) realImg.src = PHOTOS[n];

        document.querySelectorAll('pre.ascii').forEach((pre) => {
            const show = pre.dataset.art === n;
            pre.hidden = !show;
            if (show) {
                pre._lines.forEach((s) => s.classList.remove('on'));
                printAscii(pre);
            }
        });
    };

    switchBtns.forEach((b) => {
        b.setAttribute('aria-pressed', b.dataset.photo === currentPhoto ? 'true' : 'false');
        b.addEventListener('click', () => switchPhoto(b.dataset.photo));
    });

    // click the portrait to toggle between ASCII art and the real photo (in-frame)
    if (portrait) {
        const toggle = () => {
            const on = portrait.classList.toggle('is-real');
            portrait.setAttribute('aria-pressed', on ? 'true' : 'false');
        };
        portrait.addEventListener('click', toggle);
        portrait.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        });
    }

    const runSection = (sec) => {
        if (sec._ran) return;
        sec._ran = true;
        const body = sec.querySelector('.term__body');
        if (body) body.classList.add('is-visible');
        const ascii = sec.querySelector('pre.ascii:not([hidden])');
        if (ascii) printAscii(ascii);
    };

    const sections = document.querySelectorAll('[data-term]');

    if (reduced || !('IntersectionObserver' in window)) {
        sections.forEach(runSection);
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    runSection(en.target);
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.15 });
        sections.forEach((s) => io.observe(s));
    }
})();
