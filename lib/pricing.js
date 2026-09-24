export function isProductSaleActive(product, now = new Date()) {
  if (!product?.sale_price || product.sale_price >= product.price) return false
  const start = product.sale_start_at ? new Date(product.sale_start_at) : null
  const end = product.sale_end_at ? new Date(product.sale_end_at) : null
  return (!start || start <= now) && (!end || end >= now)
}

export function getEffectivePrice(product, variant, now = new Date()) {
  if (variant?.sale_price) return variant.sale_price
  if (variant?.price) return variant.price
  return isProductSaleActive(product, now) ? product.sale_price : product.price
}
