# ⛷️ 강습마스터 (SkiMaster)

스키 강사들을 위한 강습 등록 및 정산 관리 시스템

![Image](https://github.com/user-attachments/assets/280ee936-2853-4cd8-a358-9a7b38a64e2c)

배포 주소: https://teamis.vercel.app

## 목차

1. 핵심 기능 및 화면
2. 기술 스택
3. 기술적 해결 및 상세 설명
4. 데이터베이스 구조
5. 설치 및 실행

## 📋 프로젝트 소개

**강습마스터**는 개인별로 다른 강습 단가와 복잡한 가불/주급 정산을 수기로 관리하던 불편함을 해결하기 위해 개발된 모바일 웹 서비스입니다.

### 기획 의도

- 스키장이라는 특수한 환경(추위, 장갑 착용)에서도 빠르게 강습을 기록하고, 팀원들과 랭킹을 공유하여 동기부여를 얻을 수 있는 환경을 구축하고자 했습니다.

### 주요 성과

- 실제 스키 팀(15~20명 규모) 내 도입하여 정산 프로세스 자동화 및 정산 데이터의 투명성 확보.

### 📹 핵심 기능 및 화면

<br>

### 실시간 강습 등록

<p align="center">
  <img src="https://github.com/user-attachments/assets/5391c71a-1a7d-4af2-b806-8bda58883c49" width="45%"/>
  <img src="https://github.com/user-attachments/assets/12b81b45-5b09-4f58-8360-8c5e4e9fa9d8" width="45%"/>
</p>

### 정산 대시보드

<p align="center">
  <img src="https://github.com/user-attachments/assets/54aafab2-a242-4514-8322-33d450f552ee" width="45%"/>
  <img src="https://github.com/user-attachments/assets/5f13cd28-b099-4eb1-8fac-17b728bd5b26" width="45%"/>
</p>

### 주간/누적 랭킹

<p align="center">
  <img src="https://github.com/user-attachments/assets/8a9c5cdc-91a6-4f69-baf6-d2290f31ba6f" width="45%"/>
  <img src="https://github.com/user-attachments/assets/1228ddeb-ca89-4cc1-97df-c462309d64f2" width="45%"/>
</p>

### 월별 내역 관리

<img src="https://github.com/user-attachments/assets/90755c06-74cc-4948-82a3-bb9a5bae85aa" width="30%" />

## 🛠 기술 스택

### Frontend

- **Framework**: Next.js 15.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State & Action**: Next.js Server Actions
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast)
- **Progress**: Nextjs-Toploader

### Backend & Infrastructure

- **BaaS**: Supabase (Database, Auth)
- **Database**: PostgreSQL
- **Hosting**: Vercel

## 🛠 기술적 해결 및 상세 설명

#### 1️⃣ 데이터 정합성 및 중복 등록 방지

- 문제: 한 사용자가 동일한 날짜/시간(오전/오후/야간)에 실수로 여러 번 강습을 등록하여 정산 데이터가 꼬이는 이슈 발생.
- 해결: PostgreSQL의 UNIQUE Constraint를 (user_id, date, time_slot) 복합 키에 적용하여 DB 레벨에서 중복을 원천 차단하고, 프론트엔드에서는 중복 시 사용자에게 친절한 에러 메시지를 제공하도록 구현.

#### 2️⃣ Next.js 15 비동기 데이터 핸들링

- 도전: Next.js 15 업데이트에 따른 비동기 searchParams 처리 및 SSR 환경에서의 동적 렌더링 최적화.
- 해결: searchParams를 await 처리하여 주간/월간 이동 시 데이터를 즉각적으로 필터링하도록 설계하였으며, Suspense를 활용하여 useSearchParams 사용 시의 빌드 에러를 해결하고 로딩 사용자 경험(UX) 향상.

#### 3️⃣ 모바일 퍼스트 UX 및 로딩 전략

- 디자인: 큼직한 버튼과 직관적인 이모지를 사용하여 장갑을 낀 채로도 터치 오발생을 줄이는 UI 설계.
- 로딩: onSubmit 방식의 폼 처리와 전역 로딩 오버레이를 도입하여 서버 응답을 기다리는 동안 사용자가 작업 진행 상황을 명확히 인지하도록 개선.

#### 4️⃣ 데이터 스냅샷 기반 정산 로직

- 설계: 강사들의 연차별 단가 인상을 고려하여, lessons 테이블에 등록 시점의 income을 고정값으로 저장. 이를 통해 추후 마이페이지에서 단가를 수정하더라도 과거의 정산 기록이 변하지 않도록 설계하여 신뢰도 확보.

## 📁 프로젝트 구조

```
📦src/
 ┣ 📂app/
 ┃ ┣ 📂add/         # 강습 등록 (Multi-slot 지원)
 ┃ ┣ 📂login/       # 회원가입/로그인 (아이디 방식)
 ┃ ┣ 📂money/       # 정산 및 월별 내역 상세
 ┃ ┣ 📂mypage/      # 개인 단가 설정 및 프로필 관리
 ┃ ┣ 📂ranking/     # 주간/누적 랭킹 (주차 이동 로직)
 ┃ ┗ 📜layout.tsx   # 모바일 Viewport 및 TopLoader 설정
 ┣ 📂components/    # BottomNav 등 공통 UI 요소
 ┣ 📂lib/           # Supabase 클라이언트 및 전역 유틸리티
 ┗ 📜middleware.ts  # 유저 인증에 따른 라우팅 가드
```

## 🏗 데이터베이스 구조 (ERD)

- **profiles**: id(PK), username, team_name, rate_ski, rate_board
- **lessons**: id(PK), user_id(FK), date, type, time_slot, income
- **withdrawals**: id(PK), user_id(FK), amount, date, memo

## 🚀 향후 업데이트 계획

- 데이터 시각화: 월별 수익 추이 꺾은선 그래프 도입

- 엑셀 내보내기: 팀장 정산용 월간 내역 다운로드 기능

- 멀티 테넌시: 팀 코드를 통한 팀 단위 독립 운영 기능

# SkiMaster ⛷️🎿✨
