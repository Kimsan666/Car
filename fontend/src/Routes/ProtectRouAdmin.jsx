import React, { use, useEffect, useState } from "react";
import { currentAdmin } from "../api/auth";
import LoadingToRedirect from "./LoadingToRedirect";
import useCarStore from "../Store/car-store";
const ProtectRouAdmin = ({ element }) => {
  const [ok, setOk] = useState(false);
  const user = useCarStore((state) => state.user);
  const token = useCarStore((state) => state.token);

  useEffect(() => {
    if (user && token) {
      currentAdmin(token)
        .then((res) => setOk(true))
        .catch((err) => setOk(false));
    }
  }, []);
  return ok ? element : <LoadingToRedirect />;
};

export default ProtectRouAdmin;
