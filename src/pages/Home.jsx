import React, { useState } from "react";
import food from "../assets/food.png";
import { BsFacebook } from "react-icons/bs";
import { FaLine } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { BsDiscord } from "react-icons/bs";
import { FaGithubAlt } from "react-icons/fa";
import Footer from "./footer";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Home() {
  const navigate = useNavigate();
  const [secureCode, setSecureCode] = useState("");
  const handleAccessAppClick = async () => {
    if (secureCode === "") {
      Swal.fire({
        icon: "warning",
        iconColor: "yellow",
        title: "กรุณากรอกรหัสผ่านเข้าใช้งาน",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    if (secureCode.toUpperCase() === "SAU") {
      await Swal.fire({
        icon: "success",
        iconColor: "green", // เพิ่มบรรทัดนี้เพื่อให้ไอคอนเป็นสีเขียว
        title: "รหัสผ่านถูกต้อง",
        showConfirmButton: false,
        timer: 1000,
      });
      navigate("/showAllkinkun");
    } else {
      Swal.fire({
        icon: "error",
        iconColor: "#d33",
        title: "รหัสผ่านไม่ถูกต้อง",
      });
    }
  };

  return (
    <div>
      <div className="w-10/12 mx-auto border-gray-300 p-6 shadow-md my-10 rounded-lg">
        <h1 className="text-2xl font-bold text-center text-blue-700">
          Kinkun APP (Supabase)
        </h1>
        <h1 className="text-2xl font-bold text-center text-blue-700">
          บันทึกการกิน
        </h1>
        <img src={food} alt="กินกัน" className="block mx-auto w-30 mt-5" />

        <input
          type="text"
          placeholder="Enter secure code"
          value={secureCode}
          onChange={(e) => setSecureCode(e.target.value)}
          className="p-3 border border-gray-400 rounded-md mt-20 w-full"
        />

        <button
          onClick={handleAccessAppClick}
          className="w-full bg-blue-700 p-3 rounded-md text-white mt-5 cursor-pointer"
        >
          เข้าใช้งาน
        </button>

        <div className="mt-5 flex justify-center gap-5">
          <a href="#" className="cursor-pointer">
            <BsFacebook className="text-2xl text-gray-500" />
          </a>
          <a href="#" className="cursor-pointer">
            <FaLine className="text-2xl text-gray-500" />
          </a>
          <a href="#" className="cursor-pointer">
            <FaInstagram className="text-2xl text-gray-500" />
          </a>
          <a href="#" className="cursor-pointer">
            <BsDiscord className="text-2xl text-gray-500" />
          </a>
          <a href="#" className="cursor-pointer">
            <FaGithubAlt className="text-2xl text-gray-500" />
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
