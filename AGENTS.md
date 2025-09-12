# AGENTS.md — Codex 에이전트 작업 규칙
- 이 저장소에서 에이전트가 어떻게 일할지 정의합니다. 
- 간결하고 실행 가능하게 유지하세요.
- 아래 내용은 관련 작업 착수 전 반드시 확인하고, 최대한 반영하도록 합니다.

## 목적
- 기대와 경계 명시: 우선순위, 금지사항, 완료 기준(DoD).
- 작업/결정 방식의 일관성 유지.

## 의사결정 우선순위 (높음 → 낮음)
1. 현재 스레드의 명시적 사용자 요청
2. `AGENTS.md`
3. 저장소 관례와 기존 코드 스타일
4. 아래 기본 규칙

## 주의 사항
- 일부 코드에서 stream did not contain valid UTF-8 에러가 발생하니, 한글 인코딩에 유의

## 프로젝트 개요
- 이 프로젝트는 화장품 쇼핑몰을 위한 웹 애플리케이션 서비스이다.

## 사용 Stack
- Server: Express JS (ES Module)
- Database: Mongo DB (Mongoose)
- Client: Next.JS v14 Page Router
- Query: Tanstack Query (React Query)
- Style: Tailwind + Shadcn

## 코딩 스타일 
- TypeScript 사용 금지 
- JS 만 사용

## Formatter 
- Prettier 기본 Formatting 사용. 
- Semicolon: false
- Print width: 120

## Server 
- /server/src/models 에 모델 파일들. ex) index.js, user.model.js, product.model.js
- /server/src/routers 에 각 모델별 정리. ex) index.js, user.router.js, product.router.js
- /server/src/index.js 에서 importing models/index.js, routers/index.js

## User Alert
- window.alert 사용하지 않고 경고창/확인창 Hook 만들어서 Dialog 로 처리.

## 사이트 레이아웃 
- 사이트 레이아웃은 공통 레이아웃 (외부 노출용), Admin 레이아웃 (관리자 페이지용) 두 가지로 구성한다.
- 두 레이아웃 모두 반응형 디자인을 가진다.
- Footer 는 컨텐츠 내용이 부족하더라도 항상 아래쪽에 위치하도록 한다. 

### 1. 외부 노출용 레이아웃
- 공통 헤더, 공통 본문, 공통 푸터 기본으로 구성하되, 
- 랜딩 페이지는 Full Width 를 차지하는 Hero Section 이 존재한다.  
- 헤더 높이: 78px 
- 푸터 높이: 120px 
- 푸터 메뉴: 회사 소개, 브랜드 철학, 개인정보처리방침, 이용약관

### 2. Admin 용 레이아웃
- /admin 이하 메뉴는 관리자만 접근할 수 있다.
- Admin 레이아웃은 좌측 사이드바에 각 메뉴가 위치한다. 
- Admin 좌측 사이드바에 위치할 메뉴: 상품 (Products), 회원 (Users) 등 각 DB Table 의 CRUD 를 관리할 수 있도록 한다. 
- Admin 각 메뉴는 테이블 형태로 각 DB 의 최신 20건 Documents 를 조회할 수 있다. 
- 또한 각 메뉴에서 검색 버튼으로 특정 Document 를 검색할 수 있는 기능도 제공한다. 
- 테이블 각 행에서 체크박스로 동시에 여러가지 Document 를 수정할 수도 있고, 각 행의 마지막 열에 있는 상세보기 버튼 (아주 작게 문서 모양 아이콘)을 클릭해서 하나의 Document 만 수정할 수도 있다. 
- 또한 각 DB Table 마다 여러가지 Table 이 존재할텐데, 어떤 값을 노출할지 사용자가 끄고 킬 수 있으며, 이 내용은 또 별도 DB 로 저장하여 이 설정값이 유지되도록 한다. 
- Admin 레이아웃에 푸터 내용은 Appton Inc. 정도만 표시한다. (가운데 정렬)

## 메인 네비게이션 
- 메인 네비게이션은 좌측 메뉴, 우측 메뉴 두 가지 종류가 있다. 
- 각 메뉴들의 위치: 좌측 메뉴 (좌), 가운데 사이트 로고, 우측 메뉴(우)
- 각 메뉴명에 화면이 좁아질 경우 줄바꿈이 되지 않도록 설정한다. 

### 좌측 메뉴 
- SHOP | `/shop` | 제품 구매 
- ABOUT | `/about` | 브랜드 스토리 
- HOW TO USE | '/usage-guide` | 사용법

### 우측 메뉴
- SUPPORT | `/support` | 고객 지원 
- SEARCH | 검색 버튼으로 별도 라우터는 없으며 버튼 클릭시 input 창 노출, 상품명, 옵션명으로 Product 검색 후 검색 결과 표시. 검색 결과에 페이지네이션.
- CART | `/cart` | 장바구니 담긴 상품 목록 |  
- ACCOUNT | `/account` | MYPAGE 관련

### 모바일 환경에서의 네비게이션 
- 좌측에 햄버거 메뉴 
- 좌측 햄버거 메뉴에 모든 메뉴를 모두 포함하되, 검색 버튼과 장바구니 버튼은 우측으로 뺀다. 
- 가운데 사이트 로고

## 페이지별 요구 사항 

- SHOP (/shop)
    - DB 에 등록한 Product 목록을 출력한다. Product 는 각 화장품 제품이며 세트 상품이 될 수도 있다.  
    - BEST 순 정렬 (rankingScore 50점 이상 내림차순), 기능별 정렬 (tags 에 특정 string 포함 안티에이징(anti-aging), 보습(moisturizer) 등) 이 가능하다. 
    - 기본 숫자 페이지네이션 
    - Product 를 클릭하면 Product 상세 페이지로 이동한다. (/p/:pid)

- ABOUT 
    - 브랜드 스토리

- HOW TO USE 
    - 사용법 안내

- SUPPORT 
    - 고객센터 상담. 티켓 시스템. 

- CART
    - 장바구니. 비로그인 상태에서도 장바구니 추가 가능. 
    - 비로그인 상태에서 추가한 장바구니 아이템을 로그인 할 경우 그대로 가져가기. 

- ACCOUNT
    - 비로그인시: 로그인 버튼 /login 에 기본 credential + oauth 로그인 버튼 / 작게 회원가입 버튼 
    - 회원가입: /signup 에서 credential 입력 후 sign-up 가능, 그 외에 oauth 로그인 버튼도 함께 표시
    - 로그인시: MY-PAGE 버튼. /mypage 에 기본 user profile, 수정 기능, 로그아웃 버튼
    - Oauth 로그인 시 name, email 을 oauth provider 로부터 제공한 정보로 db 만들기. 없다면 [provider_xxxxxxx] 로 임의 생성

## Authentication 

- 기본 Credential 
- Sign In / Sign Up 페이지에 아래 Oauth 사용 
- OAuth: Google, Line, Facebook


## DB Model 과 각 Model 별 주요 기능

### Inventory: 재고의 단일 출처(SSOT)

1) Fields
  - sku: String,            // 고유, 불변 (unique index)
  - name: String,           // 표시 이름
  - qty: Number,            // 현재 가용 재고
  - reserved: Number,       // 결제 진행(미확정) 예약분(선택)
  - warehouseId: String,    // 멀티창고면 확장
  - updatedAt: Date

2) 주요 기능 
  - 여러 개의 Product 들이 동일한 SKU 를 가지고 주문이 들어오면 해당 Inventory 의 재고 감소
  - 즉 재고의 단일 출처 관리를 가능하도록 한다.

### Product: 상품 등록을 위한 DB. 판매용 제품이 등록된다. 

1) Fields
- sku: 구분 SKU. 영문과 숫자 조합. 최대 20자.
- name: 상품명
- option: 옵션명 
- title: 노출 타이틀 
- content: 상품 상세 컨텐츠 
- active: 외부 노출중 여부 
- price: 가격 
- shippingFee: 운송료
- reviewLink: [String] review db 에서 연결할 SKU 목록
- maxQtyPerUser: 1인당 최대 구매 개수: 기본 100
- maxQtyPerOrder: 1회 주문당 최대 구매 개수: 기본 100
- cid: 연결된 campaign id // 예: 'Ab9X3pQk'
- rankingScore: 0 ~ 100 사이의 숫자. 50점 이상이면 BEST 제품으로 분류.
- tags: [String]

2) 주요 기능: 
- 사용자당 최대 구매 개수, 1회 주문당 최대 구매 개수 코드에 반영. 

3) Admin 
- /admin/products 에서 product documents 의 기본 CRUD 관리. (테이블 표시)
- 각 행마다 맨 앞에 체크박스로 체크 기능 / 전부 체크 기능 / 체크박스로 다중 업데이트 기능 
- 각 행마다 맨 끝에 상세보기 버튼 클릭하면 Dialog 가 나오면서 값들이 input 으로 표시되고 single update 가능.
- 필드 중에 어떤 필드를 표시할지 on/off 기능. 이 설정값을 별도 저장.

### Order: 상품 주문 시 생성될 주문 모델. 

1) Fields
- orderNumber: 문자열, YYYYMMDD-랜덤/시퀀스 (사내 관리용 고유번호)
- status: 주문 상태 (pending, paid, shipped, delivered, cancelled, refunded 등)
- createdAt, updatedAt: 날짜
- userId: 사용자 _id (비회원일 경우 null 또는 guestInfo)
- guestInfo: { name, email, phone } (비회원 주문용) 
- shippingAddress: { receiverName, phone, zip, address1, address2 } 
- items: 배열
- productId: 상품 _id
- name: 주문 시점의 title 명 (스냅샷)
- sku: SKU 코드
- qty: 수량
- price: 단가 (할인 반영 후)
- originalPrice: 정상가 (비교용)
- option: { 색상, 사이즈 등 }
- cid: 캠페인 id (파트너 링크 주문일 경우만)
- trackingNo: 
- trackingCompany: 
- lastTrackUpdatedAt: 
- paymentMethod: String
- paymentAmount: String
- records: [Object] // ex [{ type: 'ordered', date: '...'}, {type: 'canceled:', date: '...'}]

2) 주요 기능: 
- Order 발생 시 연결된 SKU 의 Inventory Stock 차감. 

3) Admin 
- /admin/orders 에서 order documents 의 기본 Read/Update 관리. (테이블 표시)
- 각 행마다 맨 앞에 체크박스로 체크 기능 / 전부 체크 기능 / 체크박스로 다중 업데이트 기능 
- 각 행마다 맨 끝에 상세보기 버튼 클릭하면 Dialog 가 나오면서 값들이 input 으로 표시되고 single update 가능.
- 필드 중에 어떤 필드를 표시할지 on/off 기능. 이 설정값을 별도 저장.


### Campaign: 인플루언서 공동구매 / 판매촉진 캠페인

1) Fields
  - cid: { type: String, unique: true, index: true, required: true }, // 예: 'Ab9X3pQk'
  - name: { type: String, required: true },          // "캠페인 이름"
  - influencerEmail: { type: String, unique: true },
  - commissionRate: { type: Number, default: 0.15 },  // 0~1
  - startsAt: { type: Date },        // 캠페인 시작 일자
  - expiresAt: { type: Date },       // 유효기간
  - landingPath: { type: String },   // 상대경로: '/p/ABC123-Copy'
  - fallbackPath: { type: String },  // 유효기간이 지나면 이동할 경로' ABC123-Copy'
  - meta: { type: Object },          // 채널, 크리에이티브, UTM 등
  - active: Boolean { default: true}

2) 동작 순서 

(1) 특정 사용자가 /c/:cid 접근

(2) 예시 /c/Ab9X3pQk 접근 시, Campaign 조회 → 기간 유효 확인

(3) 기간이 유효하면, 쿠키에 cid 저장 (만료 7일): landigPath 로 이동.
기간이 유효하지 않으면 쿠키에 cid 저장 하지 않고 fallbackPath 로 이동.
기간이 유효하지 않고 / fallbackPath 가 없을 경우 landingPath 로 이동.

(4) Order.items[n] 에 쿠키에 cid 정보가 있으면 cid, influencerId, campaignSnapshot(name, commissionRate, capturedAt) 저장.

3) Admin 
- /admin/campaigns 에서 campaign documents 의 기본 CRUD 관리. (테이블 표시)
- 캠페인 이름, 
- 각 행마다 맨 앞에 체크박스로 체크 기능 / 전부 체크 기능 / 체크박스로 다중 업데이트 기능 
- 각 행마다 맨 끝에 상세보기 버튼 클릭하면 Dialog 가 나오면서 값들이 input 으로 표시되고 single update 가능.
- 필드 중에 어떤 필드를 표시할지 on/off 기능. 이 설정값을 별도 저장.

### User: 사용자 모델
- provider:
- providerId: 
- email: 
- name:
- passwordHash: 
- isAdmin: 
- shippingAddress: {
    zipCode: String
    shippingAddress1: String
    shippingAddress2: String
}

### Ticket: 고객 상담용 티켓 시스템 
    // Ticket (Mongoose 예시)
    const MessageSchema = new Schema({
    authorType: { type: String, enum: ['customer','agent'], required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
    }, { _id: false })

    const TicketSchema = new Schema({
    userId: { type: ObjectId, required: true, index: true },
    relatedOrderId: { type: ObjectId },               // 없으면 null
    category: { type: String, default: 'general' },   // 예: refund, shipping 등
    status: { type: String, enum: ['new','in_progress','waiting_customer','resolved','closed'], default: 'new', index: true },
    messages: { type: [MessageSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
    })

## 정산/리포팅:
- Order.item.cid 로 집계
- 필요 시 campaignCid로 링크/크리에이티브 단위 분석


## SEO 

### 기본 메타
- 타이틀: 핵심 키워드 | 브랜드(60자 내).
- 설명: 120–150자 요약, 행동 유도 문구 포함.
- Open Graph/Twitter: 타이틀/설명/이미지(1200×630, <200KB).

### URL/헤더
- 짧고 명확한 경로, 하이픈 사용, 소문자.
- H1 1개, H2–H3 위계 유지. 첫 문단에 핵심 키워드.

### 구조화 데이터
- 적합 시 `Organization`, `Product`, `Article` JSON-LD 추가.

### 인덱싱
- `robots.txt`, `sitemap.xml` 준비. 중요한 페이지는 `index,follow`.
- 중복 페이지는 canonical 지정.

## 성능 가이드 & 예산

### 목표(Core Web Vitals)
- LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms.

### 예산(초기 페이지)
- JS 전송 ≤ 150KB gzip, CSS ≤ 80KB gzip.
- 이미지 개별 ≤ 200KB, 폰트 파일 ≤ 100KB.

### 원칙
- 이미지: 적응형 사이즈/포맷(WebP/AVIF), 지연 로드.
- 폰트: 서브셋, `font-display: swap`, 가변폰트 선호.
- JS: 지연/조건 로딩, 중복 의존성 제거, 서버 렌더 우선.
- 캐시: 정적 에셋 해시, 장기 캐싱, HTTP/2 우선.

### 체크리스트
- [ ] 초기 렌더에 불필요한 JS 배제
- [ ] 이미지/폰트 최적화
- [ ] 코드 분할/지연 로딩 적용
- [ ] Lighthouse 90+ 유지


