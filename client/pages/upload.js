import { useState } from 'react';

export default function UploadPage() {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!selected) {
      setError('Choose a file first.');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', selected);
      const res = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Upload failed');
      setResult(json);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <h1>Upload a file</h1>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={(e) => setSelected(e.target.files?.[0] ?? null)}
        />
        <button type="submit" disabled={busy} style={{ marginLeft: 12 }}>
          {busy ? 'Uploading…' : 'Upload'}
        </button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {result && (
        <pre style={{ marginTop: 16, background: '#f6f8fa', padding: 12 }}>
{JSON.stringify(result, null, 2)}
        </pre>
      )}
      <p style={{ marginTop: 24 }}>
        <a href="/">Back home</a>
      </p>
    </main>
  );
}

