export async function getServerSideProps({ params }: any) {
  const res = await fetch(
    `http://localhost:3000/api/publications/${params.id}`
  );

  if (!res.ok) {
    return { notFound: true };
  }

  const publication = await res.json();

  return { props: { publication } };
}

export default function PublicationPage({ publication }: any) {
  return (
    <div>
      <h1>{publication.name}</h1>
      <p>{publication.description}</p>
    </div>
  );
}
