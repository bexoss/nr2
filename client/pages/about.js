import Head from 'next/head';

export default function AboutPage() {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'nanorecipe',
    url: 'http://localhost:3000',
    logo: undefined,
  };

  return (
    <>
      <Head>
        <title>About | nanorecipe</title>
        <meta name="description" content="nanorecipe의 스킨케어/메이크업 철학과 제품 기준을 소개합니다." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">About nanorecipe</h1>
        <p className="mt-3 text-gray-700">
          nanorecipe는 피부 본연의 균형을 존중하는 화장품을 만듭니다. 과한 성분과 과장된 약속 대신,
          필요한 것만 정직한 비율로 담습니다.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">브랜드 스토리</h2>
          <p className="mt-2 text-gray-700">
            우리는 민감성까지 고려한 전 성분 설계와 피부과 테스트를 기본으로 합니다. 피부가 원하는 최소한의 조합으로
            매일의 루틴을 더 가볍고 안정적으로 만듭니다.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">가치</h2>
          <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1">
            <li>성분 최소화: 꼭 필요한 유효 성분만 담기</li>
            <li>안정성 우선: 저자극, 피부과 테스트 원칙</li>
            <li>지속가능: 과대 포장 지양, 재활용 소재 우선</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">무엇을 만들까요?</h2>
          <p className="mt-2 text-gray-700">
            세안제, 토너, 세럼, 보습제, 자외선차단제를 중심으로 기본 루틴을 완성하는 라인업을 먼저 선보입니다. 이후 메이크업 제품까지 확장합니다.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href="/shop" className="px-4 py-2 rounded-md bg-gray-900 text-white">SHOP 둘러보기</a>
          <a href="/support" className="px-4 py-2 rounded-md bg-gray-100 text-gray-900">지원/문의</a>
        </div>
      </main>
    </>
  );
}
