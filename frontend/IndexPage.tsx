export default function IndexPage() {
  return (
    <form action="/composite" method="POST" encType="multipart/form-data">
      <input type="file" name="image" />
      <input type="submit" value="Unionize my avatar!" />
    </form>
  );
}
