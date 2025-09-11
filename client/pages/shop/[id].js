import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '../../lib/currency';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query || {};
  const { format } = useCurrency();

  const q = useQuery({
    queryKey: ['product', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/api/products/${id}`);
      if (!res.ok) throw new Error('Failed to load product');
      return res.json();
    },
  });

  return (
    <>
      <Head>
        <title>{q.data?.name ? `${q.data.name} | nanorecipe` : '상품 상세 | nanorecipe'}</title>
        {q.data?.description && (
          <meta name="description" content={plainText(q.data.description).slice(0, 150)} />
        )}
      </Head>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {q.isLoading ? (
          <p className="text-gray-600">상품을 불러오는 중…</p>
        ) : q.isError ? (
          <p className="text-rose-600">상품을 불러오지 못했습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="relative w-full aspect-[4/3] bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                <Image src={q.data.image} alt={q.data.name} fill className="object-cover" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{q.data.name}</h1>
              <div className="mt-2 text-lg font-semibold text-gray-900">{format(q.data.price)}</div>
              {q.data.shippingFee > 0 && (
                <div className="mt-1 text-sm text-gray-600">배송비: {format(q.data.shippingFee)}</div>
              )}
              <div className="mt-4 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: q.data.description || '' }} />
              </div>
              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 rounded-md bg-gray-900 text-white" onClick={() => addToCart(q.data)}>Add to Cart</button>
                <a href="/cart" className="px-4 py-2 rounded-md bg-gray-100 text-gray-900">View Cart</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function plainText(html) {
  if (!html) return '';
  const tmp = typeof window !== 'undefined' ? document.createElement('div') : null;
  if (!tmp) return '';
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

async function addToCart(product) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  try {
    if (!token) {
      const anon = JSON.parse(localStorage.getItem('anon_cart') || '{"items": []}');
      const items = Array.isArray(anon.items) ? anon.items : [];
      const idx = items.findIndex((it) => it.productId === product.id);
      if (idx >= 0) items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + 1 };
      else items.push({ productId: product.id, name: product.name, price: product.price, qty: 1 });
      localStorage.setItem('anon_cart', JSON.stringify({ items }));
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart:updated'));
      alert('장바구니에 담았습니다.');
      return;
    }
    const cartRes = await fetch('http://localhost:4000/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const current = cartRes.ok ? await cartRes.json() : { items: [] };
    const items = [...(current.items || [])];
    const idx = items.findIndex((it) => it.productId === product.id);
    if (idx >= 0) items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + 1 };
    else items.push({ productId: product.id, name: product.name, price: product.price, qty: 1 });

    const saveRes = await fetch('http://localhost:4000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    });
    if (!saveRes.ok) throw new Error('Failed to save cart');
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart:updated'));
    alert('장바구니에 담았습니다.');
  } catch (e) {
    alert('장바구니 저장 실패: ' + e.message);
  }
}
