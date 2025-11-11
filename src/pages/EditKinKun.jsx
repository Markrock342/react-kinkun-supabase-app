import React, { useEffect } from "react";
import food from "../assets/food.png";
import Footer from "./footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";

export default function EditKinkun() {
  const location = useLocation();
  const navigate = useNavigate();

  // รับข้อมูล kinkin จาก state
  const kinkin = location.state?.kinkin;

  // สร้าง state สำหรับฟอร์ม
  const [Food_name, setFood_name] = React.useState(kinkin?.food_name || "");
  const [Food_where, setFood_where] = React.useState(kinkin?.food_where || "");
  const [Food_pay, setFood_pay] = React.useState(kinkin?.food_pay || "");
  const [Foodfile, setFoodfile] = React.useState(null);
  const [FoodPreview, setFoodPreview] = React.useState(kinkin?.food_image_url || "");
  const [existingImageUrl, setExistingImageUrl] = React.useState(kinkin?.food_image_url || "");

  useEffect(() => {
    if (!kinkin) {
      Swal.fire({
        icon: "warning",
        title: "ไม่พบข้อมูลที่ต้องการแก้ไข กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
      });
      navigate("/showallkinkun");
    }
  }, [kinkin, navigate]);

  // สร้างฟังก์ชันเลือกรูปและแสดงรูป
  const handleSelectImageAndPreview = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFoodfile(file); // ✅ ใช้ setFoodfile
      setFoodPreview(URL.createObjectURL(file)); // ✅ ใช้ setFoodPreview
    } else {
      setFoodfile(null);
      setFoodPreview(existingImageUrl); // ✅ ถ้าไม่ได้เลือกไฟล์ใหม่ ให้กลับไปแสดงรูปเดิม
    }
  };

  // สร้างฟังก์ชัน warningAlert
  const warningAlert = (msg) => {
    Swal.fire({
      icon: "warning",
      iconColor: "#E89E07", // ✅ ปรับเป็นสีที่สอดคล้องกัน
      title: msg,
      confirmButtonColor: "#3085d6", // ✅ ปรับเป็นสีที่สอดคล้องกัน
      confirmButtonText: "ตกลง",
    });
  };

  // สร้างฟังก์ชัน successAlert
  const successAlert = (msg) => {
    Swal.fire({
      icon: "success",
      iconColor: "#108723",
      title: msg,
      confirmButtonColor: "#3085d6", // ✅ ปรับเป็นสีที่สอดคล้องกัน
      confirmButtonText: "ตกลง",
    }).then(() => {
      navigate("/showallkinkun"); // ✅ ใช้ navigate และเส้นทางที่ถูกต้อง
    });
  };

  // สร้างฟังก์ชันบันทึกข้อมูลและอัปโหลดรูปไปที่ Supabase (เปลี่ยนชื่อเป็น handleSubmit)
  const handleSubmit = async (e) => {
    // ✅ เปลี่ยนชื่อฟังก์ชัน
    e.preventDefault();

    // Validate UI
    if (Food_name.trim().length === 0) {
      // ✅ ใช้ Food_name
      warningAlert("กรุณากรอก กินอะไร ?");
      return;
    } else if (Food_where.trim().length === 0) {
      // ✅ ใช้ Food_where
      warningAlert("กรุณากรอก กินที่ไหน ?");
      return;
    } else if (Food_pay === "" || isNaN(Number(Food_pay))) {
      // ✅ ใช้ Food_pay และตรวจสอบตัวเลข
      warningAlert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }

    let current_food_image_url = existingImageUrl;

    if (Foodfile) {
      // ลบรูปเดิมถ้ามี
      if (existingImageUrl && existingImageUrl.includes("kinkin_bk")) {
        const oldFileName = existingImageUrl.split("/").pop();
        await supabase.storage.from("kinkin_bk").remove([oldFileName]);
      }
      const newFileName = Date.now() + "-" + Foodfile.name;
      const { error: uploadError } = await supabase.storage
        .from("kinkin_bk")
        .upload(newFileName, Foodfile, {
          cacheControl: "3600",
          upsert: false,
          contentType: Foodfile.type,
        });
      if (uploadError) {
        warningAlert("เกิดข้อผิดพลาดในการอัปโหลดรูป กรุณาลองใหม่อีกครั้ง...");
        return;
      }
      const { data: urlData } = supabase.storage
        .from("kinkin_bk")
        .getPublicUrl(newFileName);
      current_food_image_url = urlData.publicUrl;
    }

    // อัปเดตข้อมูลโดยใช้ id จาก kinkin
    const { error: updateError } = await supabase
      .from("kinkin_tb")
      .update({
        food_name: Food_name,
        food_where: Food_where,
        food_pay: Number(Food_pay),
        food_image_url: current_food_image_url,
      })
      .eq("id", kinkin.id);

    if (updateError) {
      warningAlert("เกิดข้อผิดพลาดในการบันทึกแก้ไขข้อมูล กรุณาลองใหม่อีกครั้ง...");
      return;
    }

    successAlert("บันทึกแก้ไขการกินเรียบร้อยแล้ว");
  };

  return (
    <div>
      <div className="w-10/12 mx-auto border-gray-300 p-6 shadow-md mt-20 rounded-lg">
        <h1 className="text-2xl font-bold text-center text-blue-700">
          Kinkun APP (Supabase)
        </h1>

        <h1 className="text-2xl font-bold text-center text-blue-700">
          แก้ไขข้อมูลการกิน
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
            <label>รูปกิน ?</label>
            <input
              onChange={handleSelectImageAndPreview}
              type="file"
              className="hidden"
              id="imageSelect"
              accept="image/*"
            />
            <label
              htmlFor="imageSelect"
              className="py-2 px-4 bg-blue-500 hover:bg-blue-700 cursor-pointer text-white rounded block w-full text-center mt-2"
            >
              เลือกรูปภาพ
            </label>
            <div className="mt-3">
              {FoodPreview && (
                <img src={FoodPreview} alt="รูปกิน" className="w-30 mx-auto" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-700 cursor-pointer p-2 text-white rounded"
            >
              บันทึกข้อมูลการกิน
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link to="/showallkinkun" className="hover:text-blue-700">
            ย้อนกลับไปหน้าข้อมูลบันทึกการกิน
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
