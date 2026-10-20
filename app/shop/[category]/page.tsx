import { redirect } from 'next/navigation';

interface Props {
  params: { category: string };
}

const CATEGORY_MAP: Record<string, string> = {
  laptops: '/laptops',
  computers: '/computers',
  'cctv-cameras': '/cctv',
  cctv: '/cctv',
  gadgets: '/smart-devices',
  'smart-devices': '/smart-devices',
  'electrical-products': '/electrical-products',
  networking: '/networking',
  accessories: '/computer-accessories',
  'computer-accessories': '/computer-accessories',
};

export default function ShopCategoryRedirect({ params }: Props) {
  const target = CATEGORY_MAP[params.category.toLowerCase()] || '/shop';
  redirect(target);
}
