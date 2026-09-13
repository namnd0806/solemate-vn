import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-sole-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-2xl font-bold text-primary">SoleMate</span>
            <span className="text-2xl font-bold text-white"> VN</span>
            <p className="text-gray-400 text-sm mt-2">Website bán giày thể thao hàng đầu Việt Nam.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Danh mục</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/nam" className="hover:text-primary transition-colors">Nam</Link></li>
              <li><Link href="/nu" className="hover:text-primary transition-colors">Nữ</Link></li>
              <li><Link href="/tre-em" className="hover:text-primary transition-colors">Trẻ em</Link></li>
              <li><Link href="/sale" className="hover:text-primary transition-colors">Giảm giá</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/track-order" className="hover:text-primary transition-colors">Tra cứu đơn hàng</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Đăng nhập</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Đăng ký</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 support@solemate.vn</li>
              <li>📞 1800 1234</li>
              <li>📍 Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SoleMate VN. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
