import Head from 'next/head'

export default function AboutPage() {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'nanorecipe',
    url: 'http://localhost:3000',
    logo: undefined,
  }

  return (
    <>
      <Head>
        <title>About | nanorecipe</title>
        <meta name="description" content="Brand philosophy and story of nanorecipe." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">About nanorecipe</h1>
        <p className="mt-3 text-gray-700">
          We craft balanced skincare that respects your skin. No exaggeration, no overload — just what you need.
        </p>

        <section id="philosophy" className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Brand Philosophy</h2>
          <p className="mt-2 text-gray-700">
            Formulas consider sensitivity and comfort as a baseline. Minimal, effective combinations for a light, consistent daily routine.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Values</h2>
          <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1">
            <li>Minimal ingredients, essential efficacy</li>
            <li>Safety first: low irritation, gentle bases</li>
            <li>Responsible sourcing and sustainable choices</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">What we make</h2>
          <p className="mt-2 text-gray-700">
            Core routine first — cleanser, toner, serum, moisturizer — then broaden to makeup essentials.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href="/shop" className="px-4 py-2 rounded-md bg-gray-900 text-white">Shop Now</a>
          <a href="/support" className="px-4 py-2 rounded-md bg-gray-100 text-gray-900">Contact Support</a>
        </div>
      </main>
    </>
  )
}
