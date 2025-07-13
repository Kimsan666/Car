import React from "react";
import AppRouter from './Routes/AppRouter'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
const App = () => {
  return (
    <>
      <ToastContainer />
      <AppRouter />
    </>
  );
};

export default App;
