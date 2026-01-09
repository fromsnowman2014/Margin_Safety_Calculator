# 설정 가이드 (Configuration Guide)

## 문서 정보
- **버전**: 1.0
- **작성일**: 2026-01-09
- **목적**: 개발 중 필요한 모든 설정을 단계별로 안내

---

## ⚠️ 중요: 이 문서를 먼저 읽으세요

개발을 시작하기 전에 **반드시** 이 가이드를 따라 모든 설정을 완료해야 합니다.
각 Phase에서 새로운 설정이 필요할 때마다 이 문서로 돌아오세요.

---

## 📋 설정 체크리스트 개요

| 설정 항목 | 필요 시점 | 필수 여부 | 소요 시간 |
|---------|----------|---------|----------|
| ✅ GitHub Repository | Day 1 | 필수 | 5분 |
| ✅ Vercel 계정 | Day 1 | 필수 | 10분 |
| ✅ Anthropic API Key | Day 7 | 필수 | 5분 |
| ✅ Financial Modeling Prep API | Day 10 | 필수 | 10분 |
| ✅ Vercel KV (Redis) | Day 11 | 필수 | 10분 |
| ✅ Upstash Rate Limit | Day 11 | 필수 | 10분 |
| ✅ Supabase Project | Day 15 (Phase 2) | 필수 | 15분 |
| ✅ Domain (선택) | Day 14 | 선택 | 30분 |

---

## 🚀 Phase 1 설정

### Day 1: GitHub Repository 설정

**⚠️ STOP HERE - Day 1 시작 전 완료 필요**

#### 1.1 GitHub Repository 생성

```bash
# 1. GitHub에서 새 repository 생성
# https://github.com/new
# Repository name: margin-safety-calculator
# Visibility: Private (또는 Public)
# ✅ Initialize with README 체크 해제

# 2. 로컬에서 프로젝트 초기화 후 연결
cd margin-safety-calculator
git init
git add .
git commit -m "feat: initial project setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/margin-safety-calculator.git
git push -u origin main
```

**검증**:
```bash
git remote -v
# origin  https://github.com/YOUR_USERNAME/margin-safety-calculator.git (fetch)
# origin  https://github.com/YOUR_USERNAME/margin-safety-calculator.git (push)
```

---

### Day 1: Vercel 계정 및 프로젝트 설정

**⚠️ STOP HERE - Day 1 완료 전 설정 필요**

#### 1.2 Vercel 계정 생성

1. https://vercel.com/signup 접속
2. "Continue with GitHub" 클릭
3. GitHub 계정 연동 승인

#### 1.3 Vercel 프로젝트 생성

1. Vercel Dashboard → "Add New..." → "Project"
2. GitHub repository 선택: `margin-safety-calculator`
3. Framework Preset: **Next.js** 자동 감지
4. Root Directory: `./` (기본값)
5. Build Command: `npm run build` (기본값)
6. Output Directory: `.next` (기본값)
7. **"Deploy" 클릭하지 말고 먼저 환경 변수 설정!**

#### 1.4 환경 변수 설정 (초기)

**Vercel Dashboard → Settings → Environment Variables**

```bash
# Phase 1 초기 설정 (Day 1)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app  # 배포 후 실제 URL로 변경
```

**검증**:
- Vercel Dashboard에서 Environment Variables 2개 확인

**📝 Note**: API 키는 Day 7, Day 10, Day 11에 추가 설정합니다.

---

### Day 1: 로컬 환경 변수 설정

#### 1.5 .env.local 파일 생성

```bash
# 프로젝트 루트에서 실행
cp .env.local.example .env.local
```

**파일**: `.env.local.example` (Git에 커밋됨)

```bash
# ==============================================
# IMPORTANT: Copy this file to .env.local
# and fill in the actual values
# ==============================================

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==============================================
# ⚠️ ADD THESE ON DAY 7 (Claude API)
# ==============================================
# Anthropic API (Claude 3.5 Sonnet)
# Get your key: https://console.anthropic.com/account/keys
ANTHROPIC_API_KEY=

# ==============================================
# ⚠️ ADD THESE ON DAY 10 (Financial Data)
# ==============================================
# Financial Modeling Prep API
# Get your key: https://site.financialmodelingprep.com/developer/docs/
FMP_API_KEY=

# ==============================================
# ⚠️ ADD THESE ON DAY 11 (Caching & Rate Limiting)
# ==============================================
# Vercel KV (Redis)
# Auto-populated by Vercel after creating KV store
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Upstash Rate Limit
# Same as KV credentials (Vercel KV uses Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ==============================================
# ⚠️ ADD THESE ON DAY 15 - PHASE 2 (Database)
# ==============================================
# Supabase
# Get from: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ==============================================
# ⚠️ OPTIONAL - PHASE 2 (Email Notifications)
# ==============================================
# Resend API (for email alerts)
# Get your key: https://resend.com/api-keys
RESEND_API_KEY=
```

**파일**: `.env.local` (Git에서 제외됨)

```bash
# 실제 값으로 채워진 파일 (예시)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ⚠️ Day 7에 추가할 것
# ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# ⚠️ Day 10에 추가할 것
# FMP_API_KEY=xxxxx

# ⚠️ Day 11에 추가할 것
# KV_REST_API_URL=xxxxx
# KV_REST_API_TOKEN=xxxxx
```

**검증**:
```bash
# .gitignore에 .env.local이 포함되어 있는지 확인
cat .gitignore | grep .env.local
# 출력: .env.local
```

---

### Day 7: Anthropic API 키 설정

**⚠️ STOP HERE - Claude API 통합 전 필수 완료**

#### 2.1 Anthropic API 키 발급

1. https://console.anthropic.com/account/keys 접속
2. "Create Key" 클릭
3. Key name: `SafetyNet Development`
4. 생성된 키 복사 (한 번만 표시됨!)

**형식**: `sk-ant-api03-...` (약 100자)

#### 2.2 로컬 환경 변수 추가

`.env.local` 파일 편집:

```bash
# Anthropic API (Claude 3.5 Sonnet)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_ACTUAL_KEY_HERE
```

#### 2.3 Vercel 환경 변수 추가

**Vercel Dashboard → Settings → Environment Variables → Add New**

```
Name: ANTHROPIC_API_KEY
Value: sk-ant-api03-YOUR_ACTUAL_KEY_HERE
Environments: Production, Preview, Development (모두 체크)
```

**검증**:
```typescript
// src/lib/ai/claude.ts에서 테스트
console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
console.log('API Key prefix:', process.env.ANTHROPIC_API_KEY?.slice(0, 10));
// 출력: API Key exists: true
// 출력: API Key prefix: sk-ant-api
```

**⚠️ 보안 주의사항**:
- ❌ 절대 Git에 커밋하지 마세요
- ❌ 클라이언트 코드에서 사용하지 마세요 (서버사이드만!)
- ✅ Vercel에서는 자동으로 암호화되어 저장됩니다

**비용 모니터링**:
- https://console.anthropic.com/settings/billing
- Alert 설정: $50 이상 사용 시 이메일 알림

---

### Day 10: Financial Modeling Prep API 설정

**⚠️ STOP HERE - 자동 데이터 수집 전 필수 완료**

#### 3.1 FMP API 키 발급

1. https://site.financialmodelingprep.com/developer/docs/ 접속
2. "Get your Free API Key" 클릭
3. 회원가입 (이메일 인증 필요)
4. Dashboard에서 API Key 복사

**무료 티어 제한**:
- 250 requests/day
- Rate limit: 5 requests/minute

#### 3.2 로컬 환경 변수 추가

`.env.local`:

```bash
# Financial Modeling Prep API
FMP_API_KEY=YOUR_FMP_KEY_HERE
```

#### 3.3 Vercel 환경 변수 추가

```
Name: FMP_API_KEY
Value: YOUR_FMP_KEY_HERE
Environments: Production, Preview, Development
```

#### 3.4 Fallback 전략 확인

FMP API가 rate limit에 도달하면 자동으로 Claude web search로 전환됩니다.
설정 파일에서 확인:

```typescript
// src/lib/data/fmp.ts
const MAX_RETRIES = 3;
const FALLBACK_TO_CLAUDE = true; // ✅ 이 값이 true인지 확인
```

**검증**:
```bash
# API 테스트 (터미널에서)
curl "https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=YOUR_KEY"
# 성공 시: JSON 데이터 반환
# 실패 시: {"Error Message": "Invalid API KEY."}
```

**사용량 모니터링**:
- https://site.financialmodelingprep.com/developer/docs/dashboard
- 일일 사용량 확인 가능

---

### Day 11: Vercel KV 및 Rate Limiting 설정

**⚠️ STOP HERE - 캐싱 및 Rate Limiting 구현 전 필수 완료**

#### 4.1 Vercel KV 스토어 생성

1. Vercel Dashboard → Storage → Create Database
2. Type: **KV**
3. Database Name: `safetynet-cache`
4. Region: **Select closest to your users** (예: US East)
5. "Create" 클릭

#### 4.2 환경 변수 자동 연결

Vercel이 자동으로 다음 변수를 프로젝트에 추가합니다:

```bash
KV_REST_API_URL=https://...vercel-storage.com
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=... (선택)
```

**확인**:
- Vercel Dashboard → Settings → Environment Variables
- 3개의 KV 관련 변수가 자동 추가되었는지 확인

#### 4.3 로컬 개발 환경 연결

```bash
# Vercel CLI 설치 (미설치 시)
npm i -g vercel

# 프로젝트와 Vercel 연결
vercel link

# 환경 변수 다운로드
vercel env pull .env.local
```

이제 `.env.local`에 KV 관련 변수가 자동으로 추가됩니다.

#### 4.4 Upstash Rate Limit 설정

Vercel KV는 내부적으로 Upstash를 사용하므로, 동일한 credentials 사용:

`.env.local`:

```bash
# Upstash Rate Limit (same as KV)
UPSTASH_REDIS_REST_URL=${KV_REST_API_URL}
UPSTASH_REDIS_REST_TOKEN=${KV_REST_API_TOKEN}
```

**또는** `.env.local`에 직접 복사:

```bash
UPSTASH_REDIS_REST_URL=https://...vercel-storage.com
UPSTASH_REDIS_REST_TOKEN=...
```

#### 4.5 Rate Limit 패키지 설치

```bash
npm install @vercel/kv @upstash/ratelimit
```

**검증**:
```typescript
// src/lib/data/cache.ts
import { kv } from '@vercel/kv';

export async function testConnection() {
  try {
    await kv.set('test', 'hello');
    const value = await kv.get('test');
    console.log('KV connected:', value === 'hello');
    return true;
  } catch (error) {
    console.error('KV connection failed:', error);
    return false;
  }
}
```

**모니터링**:
- Vercel Dashboard → Storage → safetynet-cache
- Metrics: Commands, Memory Usage, Connections

---

## 🔐 Phase 2 설정 (Day 15 이후)

### Day 15: Supabase 프로젝트 설정

**⚠️ STOP HERE - Phase 2 시작 전 필수 완료**

#### 5.1 Supabase 프로젝트 생성

1. https://app.supabase.com/ 접속 (GitHub 계정으로 로그인)
2. "New Project" 클릭
3. 설정:
   ```
   Organization: Personal (또는 새로 생성)
   Project Name: safetynet
   Database Password: (강력한 비밀번호 생성 - 저장 필수!)
   Region: Northeast US (또는 가장 가까운 지역)
   Pricing Plan: Free
   ```
4. "Create new project" 클릭 (약 2분 소요)

#### 5.2 API 키 복사

프로젝트 생성 후:
1. Settings → API
2. 다음 값들을 복사:
   - `Project URL`: https://xxxxx.supabase.co
   - `anon public` key: eyJhbGciOiJIUzI1NiIs...
   - `service_role` key: eyJhbGciOiJIUzI1NiIs... (⚠️ 절대 클라이언트에 노출하지 말 것!)

#### 5.3 로컬 환경 변수 추가

`.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

#### 5.4 Vercel 환경 변수 추가

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (⚠️ Production only, 절대 Preview에 노출하지 말 것)
```

#### 5.5 Supabase CLI 설치 및 연결

```bash
# CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref xxxxx  # Project Reference ID는 Settings → General에서 확인
```

#### 5.6 데이터베이스 마이그레이션 실행

```bash
# 마이그레이션 파일 확인
ls supabase/migrations/

# 로컬 Supabase 시작 (선택 - 로컬 개발용)
supabase start

# Production에 마이그레이션 적용
supabase db push
```

**검증**:
```bash
# 테이블 생성 확인
supabase db diff

# 또는 Supabase Dashboard → Table Editor에서 확인
# portfolios, holdings, calculations, watchlist 테이블이 있어야 함
```

---

### Day 15: Supabase Auth 설정

#### 5.7 Auth Provider 설정

1. Supabase Dashboard → Authentication → Providers
2. **Email** 활성화 (기본값)
3. 설정:
   ```
   ✅ Enable email confirmations (이메일 인증 사용)
   Site URL: https://your-project.vercel.app
   Redirect URLs: https://your-project.vercel.app/auth/callback
   ```

#### 5.8 Email Templates 커스터마이징 (선택)

1. Authentication → Email Templates
2. "Confirm signup" 템플릿 수정
3. 회사명을 "SafetyNet"으로 변경

---

## 🎛️ 선택 설정 (Optional)

### Day 14: 커스텀 도메인 설정

**선택 사항 - 브랜딩을 위해 권장**

#### 6.1 도메인 구매

추천 레지스트라:
- Namecheap: https://www.namecheap.com/
- Google Domains: https://domains.google/
- Cloudflare: https://www.cloudflare.com/products/registrar/

예시 도메인: `safetynet-invest.com`, `grahamcalc.app`

#### 6.2 Vercel에 도메인 추가

1. Vercel Dashboard → Settings → Domains
2. "Add" 클릭
3. 도메인 입력 (예: `safetynet-invest.com`)
4. Vercel이 제공하는 DNS 레코드 복사
5. 레지스트라 사이트에서 DNS 설정:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
6. SSL 인증서 자동 발급 (약 24시간 소요)

---

## 📊 설정 검증 체크리스트

### Phase 1 완료 시 검증

```bash
# 1. 환경 변수 확인
node -e "console.log({
  NODE_ENV: process.env.NODE_ENV,
  HAS_ANTHROPIC_KEY: !!process.env.ANTHROPIC_API_KEY,
  HAS_FMP_KEY: !!process.env.FMP_API_KEY,
  HAS_KV_URL: !!process.env.KV_REST_API_URL,
})"

# 출력 예시:
# {
#   NODE_ENV: 'development',
#   HAS_ANTHROPIC_KEY: true,
#   HAS_FMP_KEY: true,
#   HAS_KV_URL: true
# }

# 2. Vercel 배포 상태 확인
vercel ls

# 3. 프로덕션 환경 변수 확인
vercel env ls
```

### Phase 2 완료 시 검증

```bash
# Supabase 연결 확인
supabase status

# 테이블 존재 확인
supabase db diff
```

---

## 🚨 트러블슈팅

### 문제 1: "ANTHROPIC_API_KEY is not defined"

**원인**: 환경 변수가 로드되지 않음

**해결**:
```bash
# .env.local 파일이 존재하는지 확인
ls -la .env.local

# 개발 서버 재시작
npm run dev
```

### 문제 2: "FMP API rate limit exceeded"

**원인**: 하루 250회 제한 초과

**해결**:
1. Fallback이 자동으로 Claude web search로 전환되는지 확인
2. 또는 Manual Input 모드 사용
3. 내일까지 대기 (UTC 기준 자정에 리셋)

### 문제 3: "KV connection failed"

**원인**: Vercel KV 환경 변수 누락

**해결**:
```bash
# Vercel 환경 변수 다시 다운로드
vercel env pull .env.local --force

# 개발 서버 재시작
npm run dev
```

### 문제 4: "Supabase migration failed"

**원인**: 마이그레이션 파일 오류 또는 연결 문제

**해결**:
```bash
# 연결 상태 확인
supabase status

# 마이그레이션 파일 검증
supabase db lint

# 수동으로 SQL 실행 (최후의 수단)
# Supabase Dashboard → SQL Editor에서 migration 파일 내용 복사 후 실행
```

---

## 📝 설정 변경 이력

| 날짜 | 변경 사항 | 담당자 |
|------|----------|--------|
| 2026-01-09 | 초기 문서 작성 | - |
| - | - | - |

---

## 🔗 참고 링크

- [Anthropic API Docs](https://docs.anthropic.com/)
- [Financial Modeling Prep Docs](https://site.financialmodelingprep.com/developer/docs/)
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)
- [Supabase Docs](https://supabase.com/docs)
- [Upstash Rate Limit](https://github.com/upstash/ratelimit)

---

**문서 상태**: ✅ Ready for Use
**다음 단계**: DEVELOPMENT_PLAN.md의 Day 1부터 시작 (이 문서를 참고하며 진행)
