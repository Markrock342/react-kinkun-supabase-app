import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AddKinKun from "./pages/AddKinKun";
import EditKinKun from "./pages/EditKinKun";
import ShowALLKinkKin from "./pages/ShowALLKinkKin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/addKinKun" element={<AddKinKun />} />
        <Route path="/editKinKun" element={<EditKinKun />} />
        <Route path="/showAllKinKun" element={<ShowALLKinkKin />} />
      </Routes>
    </BrowserRouter>
  );
}
