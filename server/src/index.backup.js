
  // Seed Inventory for products
  try {
    const prods = await Product.find().lean()
    for (const p of prods) {
      const inv = await Inventory.findOne({ sku: p.sku })
      if (!inv) {
        await Inventory.create({ sku: p.sku, name: p.name, qty: 100 })
      }
    }
  } catch (e) { console.warn('Inventory seed skipped:', e?.message || e) }

  // Seed a sample campaign
  try {
    const exists = await Campaign.findOne({ cid: 'Ab9X3pQk' })
    if (!exists) {
      await Campaign.create({ cid: 'Ab9X3pQk', name: 'Glow Week', commissionRate: 0.2, landingPath: '/shop', fallbackPath: '/', active: true, startsAt: new Date(Date.now()-86400000), expiresAt: new Date(Date.now()+86400000*30) })
      console.log('Seeded sample campaign Ab9X3pQk')
    }
  } catch (e) { console.warn('Campaign seed skipped:', e?.message || e) }






