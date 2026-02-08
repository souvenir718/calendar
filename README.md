# Company Schedule (사내 일정 관리)

이 프로젝트는 Next.js와 Prisma를 사용하여 구축된 사내 일정 관리 애플리케이션입니다. 직원들이 회사의 주요 일정, 회의, 휴가 등을 캘린더 형태로 확인하고 관리할 수 있도록 돕습니다.

## 🛠 기술 스택 (Tech Stack)

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **State Management / Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Deployment**: Vercel (권장)

## ✨ 주요 기능 (Features)

- **일정 관리**: 일정(제목, 날짜, 시간, 설명)을 추가, 수정, 삭제할 수 있습니다.
- **카테고리 분류**: 다양한 일정 카테고리를 지원하여 일정을 쉽게 구분할 수 있습니다.
  - `MEETING`: 회의
  - `DAY_OFF`: 연차
  - `AM_HALF`: 오전 반차
  - `PM_HALF`: 오후 반차
  - `HOLIDAY`: 공휴일
  - `IMPORTANT`: 중요 일정
  - `PAYDAY`: 급여일
  - `OTHER`: 기타
- **캘린더 뷰**: 월별, 일별 일정을 직관적으로 확인할 수 있습니다.
- **반응형 디자인**: 다양한 디바이스 환경을 지원합니다 (PWA 지원).
- **테마 지원**: 다크 모드/라이트 모드를 지원합니다.

## 🚀 시작하기 (Getting Started)

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd company-schedule
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. 환경 변수 설정 (.env)

프로젝트 루트에 `.env` 파일을 생성하고 데이터베이스 연결 정보를 입력해야 합니다.

```env
# Prisma 데이터베이스 연결 URL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 3. 데이터베이스 설정

Prisma를 사용하여 데이터베이스 스키마를 동기화하고 클라이언트를 생성합니다.

```bash
# Prisma Client 생성
npx prisma generate

# 데이터베이스 스키마 푸시 (개발 환경)
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 📂 프로젝트 구조 (Project Structure)

```
.
├── prisma/              # Prisma 스키마 및 마이그레이션 파일
├── public/              # 정적 자산 (이미지 등)
├── src/
│   ├── app/             # Next.js App Router 페이지 및 API 라우트
│   ├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── lib/             # 유틸리티 함수 및 설정
│   └── ...
├── .env                 # 환경 변수 (gitignored)
├── next.config.ts       # Next.js 설정
└── package.json         # 프로젝트 의존성 및 스크립트
```

## 📜 스크립트 (Scripts)

- `dev`: 개발 서버를 실행합니다.
- `build`: 프로덕션 배포를 위해 애플리케이션을 빌드합니다.
- `start`: 빌드된 애플리케이션을 실행합니다.
- `lint`: ESLint를 실행하여 코드를 검사합니다.
- `postinstall`: 의존성 설치 후 `prisma generate`를 자동으로 실행합니다.

## 📚 더 알아보기 (Learn More)

이 프로젝트에 사용된 기술에 대해 더 알고 싶다면 다음 리소스를 참고하세요:

- [Next.js 문서](https://nextjs.org/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
