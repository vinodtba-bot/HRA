import { t } from '@/lib/lang';

export default async function Home() {
  const { s } = await t();
  return (
    <main>
      <h1>{s.home.h1}</h1>
      <p>{s.home.body}</p>
    </main>
  );
}
