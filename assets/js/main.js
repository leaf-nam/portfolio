// 스크롤 스냅 진행률 + 도트 + 그래프 애니메이션 + 아키텍처 인터랙션
(function () {
  const scroller = document.getElementById('scroller');
  const bar = document.getElementById('progress-bar');

  scroller.addEventListener('scroll', () => {
    const max = scroller.scrollHeight - scroller.clientHeight;
    const p = max > 0 ? (scroller.scrollTop / max) * 100 : 0;
    bar.style.width = p + '%';
  }, { passive: true });

  // 현재 섹션 도트 표시 + 그래프 애니메이션 (떠나면 리셋, 돌아오면 리플레이)
  const dots = [...document.querySelectorAll('[data-dot]')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        dots.forEach((d) => d.classList.toggle('active', d.dataset.dot === e.target.id));
        // 재진입 시 transition이 다시 발동하도록 리플로우 후 클래스 부착
        e.target.classList.remove('visible');
        void e.target.offsetWidth;
        e.target.classList.add('visible');
        // 도넛 숫자 카운트 (리셋 후 재시작)
        e.target.querySelectorAll('.count').forEach(runCount);
      } else {
        e.target.classList.remove('visible');
        e.target.querySelectorAll('.count').forEach(resetCount);
      }
    });
  }, { root: scroller, threshold: 0.3 });
  document.querySelectorAll('.screen').forEach((s) => { s.classList.add('reveal'); io.observe(s); });

  function resetCount(el) {
    delete el.dataset.done;
    el.textContent = '0';
  }

  function runCount(el) {
    resetCount(el);
    el.dataset.done = '1';
    const target = Number(el.dataset.count || 0);
    const t0 = performance.now();
    const dur = 1200;
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (0.2 + 0.8 * k));
      if (el.dataset.done && k < 1) requestAnimationFrame(tick);
      else if (el.dataset.done) el.textContent = target;
    })(t0);
  }

  // PDF 버튼
  document.getElementById('btn-print').addEventListener('click', () => window.print());

  // 아키텍처 인터랙션
  const info = {
    client: ['Browser — 정적 페이지', '이 포트폴리오 자체가 예시입니다. 빌드 없이 HTML/CSS/JS만으로 GitHub Pages에 배포됩니다.', 'HTML · CSS scroll-snap · print CSS'],
    cdn: ['GitHub Pages — CDN', 'main 브랜치 push → Actions가 Pages에 자동 배포합니다. 비용 0원, HTTPS 기본 제공.', 'Actions · deploy-pages · .nojekyll'],
    api: ['API 서버 — Spring (예시)', '주문/결제 도메인 예시입니다. 분산락과 순서 보장으로 oversell 0건을 목표로 합니다.', 'Spring · JPA · Redis lock'],
    db: ['DB / Cache (예시)', '읽기 경로 인덱스 튜닝, 쓰기 경로 캐시 무효화 전략을 예시로 둡니다.', 'MySQL · Redis · 인덱스'],
    queue: ['Queue · Batch (예시)', 'Kafka로 순서 보장, CDC로 정산 증분 처리. 야간 전량 배치를 대체하는 구조 예시입니다.', 'Kafka · Debezium · Batch'],
  };
  const title = document.getElementById('arch-title');
  const desc = document.getElementById('arch-desc');
  const stack = document.getElementById('arch-stack');
  document.querySelectorAll('.node').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.node').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const v = info[btn.dataset.node];
      if (v) { title.textContent = v[0]; desc.textContent = v[1]; stack.textContent = v[2]; }
    });
  });
})();
