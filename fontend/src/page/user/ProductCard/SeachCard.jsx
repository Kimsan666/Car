import React, { useEffect, useState } from "react";
import useJimStore from "../../kaika-Store/jim-store";

const SeachCard = () => {
  const getProduct = useJimStore((state) => state.getProduct);
  const products = useJimStore((state) => state.products);
  const actionSeachProduct = useJimStore((state) => state.actionSeachProduct);

  const [text, setText] = useState("");
  // console.log(text);
  //Step 1 Seach Product
  useEffect(() => {
    const delay = setTimeout(() => {
      if (text) {
         console.log(text);
        actionSeachProduct({ query: text });
      } else {
        getProduct();
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [text]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ຄົ້ນຫາສິນຄ້າ</h1>
      <input
        onChange={(e) => setText(e.target.value)}
        placeholder="ຄົ້ນຫາ"
        className="border p-2 w-full rounded-md mb-4 px-2"
      />
    </div>
  );
};

export default SeachCard;
