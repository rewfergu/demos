import { useEffect, useState } from "react";

export const Satellite = () => {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    console.log("here we go", rotation);
    setRotation((rotation) => rotation + 1);
  });
  return (
    <div>
      {rotation}
      <svg
        width="10"
        height="10"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20.42 20.42"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "50px 50px",
        }}
      >
        <circle fill="red" cx="10.21" cy="10.21" r="10.21" />
      </svg>
    </div>
  );
};
