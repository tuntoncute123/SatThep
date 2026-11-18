'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, end = false, className = '', ...props }) {
  const pathname = usePathname();
  const active = pathname === href || (!end && pathname.startsWith(`${href}/`));

  return (
    <Link
      {...props}
      href={href}
      className={[className, active ? 'active' : ''].filter(Boolean).join(' ')}
      aria-current={active ? 'page' : undefined}
    />
  );
}
