import { Link } from "react-router-dom";

export default function Error() {
  return (
    <section className="section error-404 d-flex flex-column align-items-center justify-content-center">
      <h1>404</h1>
      <h2>The page you are looking for does not exist.</h2>
      <Link className="btn" to={"/"}>
        Back to home
      </Link>
      <img
        src="/src/assets/img/not-found.svg"
        className="img-fluid py-5"
        alt="Page Not Found"
        width={300}
      />
    </section>
  );
}
