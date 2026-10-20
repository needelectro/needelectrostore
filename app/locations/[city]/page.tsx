import { redirect } from 'next/navigation';

interface Props {
  params: { city: string };
}

const LOCATION_MAP: Record<string, string> = {
  moulvibazar: '/moulvibazar',
  sylhet: '/sylhet',
  sreemangal: '/sreemangal',
  kulaura: '/kulaura',
  rajnagar: '/rajnagar',
};

export default function LocationCityRedirect({ params }: Props) {
  const target = LOCATION_MAP[params.city.toLowerCase()] || '/moulvibazar';
  redirect(target);
}
