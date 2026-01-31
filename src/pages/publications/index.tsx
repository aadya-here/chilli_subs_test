export async function getServerSideProps() {
  // Use an environment variable, falling back to localhost for dev
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const res = await fetch(`${baseUrl}/api/publications`);
  const publications = await res.json();

  return { props: { publications } };
}
export default function Publications({ publications }: any) {
  return (
    <div>
      {publications.map((p: any) => (
        <a key={p.id} href={`/publications/${p.id}`}>
          {p.name}
        </a>
      ))}
    </div>
  );
}
