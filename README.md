# Portfolio (예시)

정적 포트폴리오 예시입니다. 빌드 없이 `index.html`만으로 동작합니다.

## 구조
- 웹 4쪽 = PDF 2쪽
  - 웹 1~2쪽 → PDF 1쪽
  - 웹 3~4쪽 → PDF 2쪽
- `assets/css/style.css`의 `@media print`가 2쪽 합치기를 담당
- `assets/js/main.js`가 스크롤 스냅 진행률, 그래프 애니메이션, 아키텍처 클릭 처리

## 로컬 확인
```bash
python3 -m http.server 8000
# http://localhost:8000
```

## PDF 내보내기
1. 우상단 `PDF로 내보내기` 클릭
2. Chrome 인쇄 설정 권장값:
   - 대상: PDF로 저장
   - 용지: A4, 여백: 없음
   - 배경 그래픽: ON
   - 머리글/바닥글: OFF

## 배포
- `main`에 push하면 GitHub Actions가 GitHub Pages로 자동 배포
- Settings → Pages → Source가 `GitHub Actions`인지 확인
