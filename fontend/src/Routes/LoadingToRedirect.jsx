import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const LoadingToRedirect = () => {
  const [count, setCount] = useState(5);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((currentCount) => {
        if (currentCount === 1) {
          clearInterval(interval);
          setRedirect(true);
        }
        return currentCount - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (redirect) {
    return <Navigate to="/" />;
  }
  return (
    <div className="text-3xl flex flex-col items-center justify-center min-h-screen bg-gray-100 font-phetsarath">
      <div className="border-4 border-red-800 rounded-xl p-6 bg-white   shadow-lg text-center">
        <div className="text-yellow-500 animate-pulse-fast mb-4 text-6xl">⚠️</div>
        ບໍ່ອານຸຍາດໃຫ້ເຂົ້າໄປສູ່ໜ້ານີ້ຈະ ສົ່ງກັບສູ້ຫນ້າ Login ໃນອີກ{" "}
        <span className="text-red-500">{count}</span> ວິນາທີ
      </div>
    </div>
  );
};

export default LoadingToRedirect;
