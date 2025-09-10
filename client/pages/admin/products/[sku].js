import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

function useToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export default function AdminProductEdit() {
  const router = useRouter();
  const { sku } = router.query;
  const token = useToken();
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:4000/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setMe);
  }, [token]);

  const q = useQuery({
    queryKey: ['admin','product', sku],
    enabled: mounted && !!token && !!sku,
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/api/admin/products/${sku}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`http://localhost:4000/api/admin/products/${sku}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => router.push('/admin'),
  });

  if (!mounted) return <main className="max-w-4xl mx-auto px-4 py-6">Loading…</main>;
  if (!token) return <main className="max-w-4xl mx-auto px-4 py-6">로그인이 필요합니다.</main>;
  if (!me?.isAdmin) return <main className="max-w-4xl mx-auto px-4 py-6">관리자 권한이 없습니다.</main>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">상품 수정</h1>
      {q.isLoading ? (
        <p>Loading…</p>
      ) : q.isError ? (
        <p className="text-rose-600">불러오기 실패</p>
      ) : (
        <ProductForm initial={q.data} onSave={(data) => mutation.mutate(data)} />
      )}
      <div className="mt-4">
        <a className="text-gray-700 underline" href="/admin">← 목록으로</a>
      </div>
    </main>
  );
}

function ProductForm({ initial, onSave }) {
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price || 0);
  const [image, setImage] = useState(initial?.image || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [shippingFee, setShippingFee] = useState(initial?.shippingFee || 0);
  const [maxQtyPerUser, setMaxQtyPerUser] = useState(initial?.maxQtyPerUser || 0);
  const [active, setActive] = useState(initial?.active ?? true);
  const quillRef = useRef(null);

  const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

  async function uploadFile(file) {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('http://localhost:4000/upload', { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || 'Upload failed');
    const rel = json.path || json.filename;
    const url = rel.startsWith('http') ? rel : `http://localhost:4000/${rel}`;
    return url;
  }

  function onToolbarImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await uploadFile(file);
        const editor = quillRef.current?.getEditor?.();
        const range = editor?.getSelection(true);
        editor?.insertEmbed(range ? range.index : 0, 'image', url, 'user');
      } catch (e) {
        alert('이미지 업로드 실패: ' + (e.message || e));
      }
    };
    input.click();
  }

  const quillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: { image: onToolbarImage },
    },
  };

  function submit(e) {
    e.preventDefault();
    onSave({ name, price: Number(price), image, description, shippingFee: Number(shippingFee), maxQtyPerUser: Number(maxQtyPerUser), active });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">상품명</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">가격 (JPY)</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">배송비 (JPY)</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">1인당 최대 구매수량 (0=제한없음)</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={maxQtyPerUser} onChange={(e) => setMaxQtyPerUser(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-700">썸네일 이미지</label>
        <div className="flex gap-2">
          <input className="flex-1 border rounded px-3 py-2" placeholder="이미지 URL" value={image} onChange={(e) => setImage(e.target.value)} />
          <label className="px-3 py-2 rounded bg-gray-100 text-gray-900 cursor-pointer">
            업로드
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try { const url = await uploadFile(f); setImage(url); } catch (err) { alert('업로드 실패'); }
            }} />
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-700">본문</label>
        <ReactQuill ref={quillRef} theme="snow" value={description} onChange={setDescription} modules={quillModules} className="bg-white" />
      </div>
      <div className="flex items-center gap-2">
        <input id="active" type="checkbox" checked={!!active} onChange={(e) => setActive(e.target.checked)} />
        <label htmlFor="active">활성화</label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 rounded bg-gray-900 text-white">저장</button>
        <a href="/admin" className="px-4 py-2 rounded bg-gray-100 text-gray-900">취소</a>
      </div>
    </form>
  );
}
