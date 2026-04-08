import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div>
      <h1>NotFound page</h1>
      <h4>
        <Link to="/">Go to Home Page</Link>
      </h4>
    </div>
  );
};

export default NotFound;
