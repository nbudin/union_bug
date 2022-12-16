export default function IndexPage() {
  return (
    <>
      <div className="container">
        <h1>Union Bug</h1>
        <form action="/composite" method="POST" encType="multipart/form-data">
          <div className="mb-3">
            <label htmlFor="imageInput" className="form-label">
              Choose an image for your avatar
            </label>
            <input
              className="form-control"
              type="file"
              id="imageInput"
              name="image"
            ></input>
          </div>
          <input
            type="submit"
            value="Unionize my avatar!"
            className="btn btn-success"
          />
        </form>
      </div>
    </>
  );
}
