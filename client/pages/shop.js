import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '../lib/currency';

export default function ShopPage() {
  const { format } = useCurrency();

  const q = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      return res.json();
    },
  });

  return (
    <>
      <Head>
        <title>Shop | nanorecipe</title>
        <meta name="description" content="nanorecipe 화장품을 둘러보고 구매하세요." />
      </Head>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Shop</h1>
        {q.isLoading ? (
          <p className="text-gray-600">상품을 불러오는 중…</p>
        ) : q.isError ? (
          <p className="text-rose-600">상품을 불러오지 못했습니다.</p>
        ) : (
          <section aria-label="상품 목록" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(q.data || []).map((p) => (
              <article key={p.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <Link href={`/shop/${encodeURIComponent(p.id)}`} className="block group">
                  <div className="relative w-full h-52">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-medium text-gray-900 group-hover:underline">{p.name}</h2>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{p.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{format(p.price)}</span>
                      <span className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm">보기</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
