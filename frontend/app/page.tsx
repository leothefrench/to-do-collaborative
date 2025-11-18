import HomeContent from '@/components/HomeContent';
import { isLoggedIn } from '@/actions/authActions';

export default async function HomePage() {
  const isUserLoggedIn = await isLoggedIn();

  return <HomeContent isLoggedIn={isUserLoggedIn} />;
}
