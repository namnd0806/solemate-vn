import Link from 'next/link'
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, YoutubeIcon } from './Icons'

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[#111315] text-white">
      <div className="pointer-events-none absolute -bottom-36 -left-24 h-72 w-[55%] rounded-[100%] border border-primary/15" />
      <div className="pointer-events-none absolute -bottom-48 -right-10 h-72 w-[52%] rounded-[100%] border border-primary/10" />
      <div className="store-container relative py-12 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_.8fr_.8fr_1.15fr]">
          <div>
            <Link href="/" className="text-[26px] font-black tracking-[-.045em]"><span className="text-primary">Sole</span>Mate VN</Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/48">Nơi mỗi bước chân gặp đúng phong cách. Giày chính hãng, trải nghiệm mua sắm minh bạch và tận tâm.</p>
            <div className="mt-6 flex gap-2">
              {[FacebookIcon, InstagramIcon, YoutubeIcon].map((Icon, index) => (
                <span key={index} className="grid size-9 place-items-center rounded-full border border-white/10 text-white/55" aria-label={['Facebook', 'Instagram', 'YouTube'][index]} role="img"><Icon className="size-[17px]" /></span>
              ))}
            </div>
          </div>

          <FooterLinks title="Danh mục" links={[['Nam','/nam'],['Nữ','/nu'],['Trẻ em','/tre-em'],['Giảm giá','/sale']]} />
          <FooterLinks title="Hỗ trợ" links={[['Tra cứu đơn hàng','/track-order'],['Đơn hàng của tôi','/account/orders'],['Đăng nhập','/login'],['Đăng ký','/register']]} />

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[.15em] text-white/80">Liên hệ</h3>
            <ul className="mt-5 space-y-3.5 text-sm text-white/50">
              <li className="flex items-center gap-3"><MailIcon className="size-4 text-primary" /><a href="mailto:support@solemate.vn" className="transition hover:text-white">support@solemate.vn</a></li>
              <li className="flex items-center gap-3"><PhoneIcon className="size-4 text-primary" /><a href="tel:18001234" className="transition hover:text-white">1800 1234</a></li>
              <li className="flex items-center gap-3"><PinIcon className="size-4 text-primary" /><span>Hà Nội, Việt Nam</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-11 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-white/32 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SoleMate VN. All rights reserved.</p>
          <p className="flex items-center gap-3">Bước cùng bạn trên mọi hành trình <span className="h-px w-8 bg-primary" /></p>
        </div>
      </div>
    </footer>
  )
}

function FooterLinks({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[.15em] text-white/80">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm text-white/48">
        {links.map(([label, href]) => <li key={href}><Link href={href} className="transition hover:text-primary">{label}</Link></li>)}
      </ul>
    </div>
  )
}
