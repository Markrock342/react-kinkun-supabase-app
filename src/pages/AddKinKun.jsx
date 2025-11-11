import React from "react";
import food from "../assets/food.png";
import Footer from "./footer";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";

export default function AddKinKun() {
  const navigate = useNavigate();
  const [Food_name, setFood_name] = React.useState("");
  const [Food_where, setFood_where] = React.useState("");
  const [Food_pay, setFood_pay] = React.useState("");
  const [Foodfile, setFoodfile] = React.useState(null);
  const [FoodPreview, setFoodPreview] = React.useState("");

  // ✅ ฟังก์ชันเลือกรูปภาพและแสดงตัวอย่าง
  const handleSelectImageAndPreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoodfile(file);
      setFoodPreview(URL.createObjectURL(file));
    } else {
      setFoodfile(null);
      setFoodPreview("");
    }
  };

  // ✅ Alert ฟังก์ชัน
  const warningAlert = (msg) => {
    Swal.fire({
      icon: "warning",
      iconColor: "yellow",
      title: msg,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "ตกลง",
    });
  };

  const successAlert = (msg) => {
    Swal.fire({
      icon: "success",
      iconColor: "green",
      title: msg,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "ตกลง",
    }).then(() => {
      navigate("/showallkinkun");
    });
  };

  // ✅ ฟังก์ชันส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบข้อมูลก่อนบันทึก
    if (Food_name.trim().length === 0) {
      return warningAlert("กรุณากรอก กินอะไร");
    }
    if (Food_where.trim().length === 0) {
      return warningAlert("กรุณากรอก กินที่ไหน");
    }
    if (Food_pay.trim() === "" || isNaN(Number(Food_pay))) {
      return warningAlert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
    }
    if (!Foodfile) {
      return warningAlert("กรุณาเลือกรูปภาพอาหาร");
    }

    // ✅ เริ่มอัปโหลดรูป
    let food_image_url = "";
    const newFileName = `${Date.now()}-${Foodfile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("kinkin_bk") // ชื่อ bucket ของคุณ
      .upload(newFileName, Foodfile, {
        cacheControl: "3600",
        upsert: false,
        contentType: Foodfile.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return warningAlert(
        "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองอีกครั้ง: " +
          uploadError.message
      );
    }

    // ✅ ดึง Public URL ของรูปจาก Supabase
    const { data: urlData } = supabase.storage
      .from("kinkin_bk")
      .getPublicUrl(newFileName);

    food_image_url = urlData.publicUrl;

    // ✅ บันทึกข้อมูลลง Table
    const { error: insertError } = await supabase.from("kinkin_tb").insert([
      {
        food_name: Food_name,
        food_where: Food_where,
        food_pay: Number(Food_pay),
        food_image_url: food_image_url,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      // ✅ ปรับข้อความ warningAlert ให้ตรงกับรูปภาพ
      warningAlert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล กรุณาลองใหม่อีกครั้ง...");
      return;
    }

    // ✅ แจ้งเตือนสำเร็จ
    successAlert("บันทึกเพิ่มการกินเรียบร้อยแล้ว");

    // ✅ กลับไปหน้าแสดงผล (คอมเมนต์ไว้ตามรูปภาพ)
    // document.location.href = "/showAllkinkun";
  };

  return (
    <div>
      <div className="w-10/12 mx-auto border-gray-300 p-6 shadow-md mt-20 rounded-lg">
        <h1 className="text-2xl font-bold text-center text-blue-700">
          Kinkun APP (Supabase)
        </h1>
        <h1 className="text-2xl font-bold text-center text-blue-700 mt-1">
          ข้อมูลบันทึกการกิน
        </h1>
        <img src={food} alt="กินกัน" className="block mx-auto w-20 mt-5 mb-5" />

        <form onSubmit={handleSubmit}>
          <div>
            <label>กินอะไร ?</label>
            <input
              value={Food_name}
              onChange={(e) => setFood_name(e.target.value)}
              placeholder="เช่น Pizza, KFC, ...."
              type="text"
              className="border border-gray-400 w-full p-2 mt-1 rounded"
            />
          </div>

          <div className="mt-3">
            <label>กินที่ไหน ?</label>
            <input
              value={Food_where}
              onChange={(e) => setFood_where(e.target.value)}
              placeholder="เช่น KFC หนองแขม, Pizza หน้ามอเอเชีย, ...."
              type="text"
              className="border border-gray-400 w-full p-2 mt-1 rounded"
            />
          </div>

          <div className="mt-3">
            <label>กินไปเท่าไหร่ ?</label>
            <input
              value={Food_pay}
              onChange={(e) => setFood_pay(e.target.value)}
              placeholder="เช่น 100, 299.50, ...."
              type="number"
              className="border border-gray-400 w-full p-2 mt-1 rounded"
            />
          </div>

          <div className="mt-3">
            <label className="block">รูปกิน ?</label>
            <input
              onChange={handleSelectImageAndPreview}
              type="file"
              id="selectImage"
              className="hidden"
            />
            <label
              htmlFor="selectImage"
              className="py-2 px-4 bg-blue-600 hover:bg-blue-900 cursor-pointer
              text-white rounded text-center block"
            >
              เลือกรูปภาพ
            </label>
            {FoodPreview && (
              <img
                src={FoodPreview}
                alt="รูปตัวอย่างอาหาร"
                className="block mx-auto w-40 mt-5 mb-5 rounded-lg shadow"
              />
            )}
          </div>

          <button
            type="submit"
            className="bg-green-600 w-full hover:bg-green-900 text-white
            py-3 px-6 rounded mt-5 mx-auto block cursor-pointer"
          >
            บันทึกข้อมูลการกิน
          </button>

          <div className="text-center mt-4 text-blue-600 hover:text-blue-900">
            <Link to="/showAllkinkun" className="hover:underline">
              ย้อนกลับไปหน้าข้อมูลบันทึกการกิน
            </Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
