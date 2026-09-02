(() => {
    document.documentElement.classList.add('js');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const portrait = document.getElementById('portrait');
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
        }, 26);
    };

    const runSection = (sec) => {
        if (sec._ran) return;
        sec._ran = true;
        const body = sec.querySelector('.term__body');
        if (body) body.classList.add('is-visible');
        const ascii = sec.querySelector('pre.ascii');
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
