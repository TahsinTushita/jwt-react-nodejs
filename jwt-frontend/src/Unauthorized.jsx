import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  return (
    <>
      <h1>Unauthorized</h1>
      <button onClick={goBack}>Go back</button>
    </>
  );
};

export default Unauthorized;
