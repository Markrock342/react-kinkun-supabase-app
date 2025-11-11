
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import food from "../assets/food.png";
import Footer from "./footer";
import { supabase } from "./../lib/supabaseClient";
import Swal from "sweetalert2";

export default function ShowALLKinkKin() {
  const [kinkins, setKinkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // เพิ่ม state สำหรับช่องค้นหา

  useEffect(() => {
    const fetchKinkins = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("kinkin_tb")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setKinkins(data || []);
      } catch (ex) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text:
            "เกิดข้อผิดพลาดในการดึงข้อมูลการกิน กรุณาลองอีกครั้ง: " +
            ex.message,
          confirmButtonText: "ตกลง",
        });
        console.error("Error fetching kinkins:", ex);
      } finally {
        setLoading(false);
      }
    };
    fetchKinkins();
  }, []);

  // ฟังก์ชันสำหรับกรองข้อมูลตามคำค้นหา
  const filteredKinkins = kinkins.filter(
    (kinkin) =>
      kinkin.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kinkin.food_where.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ฟังก์ชันสำหรับลบข้อมูล
  const handleDelete = async (id, imageUrl) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบข้อมูลการกินนี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // 1. ลบรูปภาพออกจาก Supabase Storage (ถ้ามี)
          if (imageUrl && imageUrl.includes("kinkin_bk")) {
            const fileName = imageUrl.split("/").pop();
            const { error: storageError } = await supabase.storage
              .from("kinkin-bk")
              .remove([fileName]);

            if (storageError) {
              console.error(
                "Error deleting image from storage:",
                storageError.message
              );
            }
          }

          // 2. ลบข้อมูลออกจากฐานข้อมูล Supabase
          const { error: dbError } = await supabase
            .from("kinkin_tb")
            .delete()
            .eq("id", id);

          if (dbError) throw dbError;

          // อัปเดต state เพื่อให้ UI แสดงผลข้อมูลที่เหลือ
          setKinkins(kinkins.filter((kinkin) => kinkin.id !== id));

          Swal.fire("ลบสำเร็จ!", "ข้อมูลการกินถูกลบเรียบร้อยแล้ว", "success");
        } catch (ex) {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองอีกครั้ง: " + ex.message,
            confirmButtonText: "ตกลง",
          });
          console.error("Error deleting kinkin:", ex);
        }
      }
    });
  };

  // คำนวณยอดรวมค่าใช้จ่าย
  const totalFoodPay = filteredKinkins.reduce(
    (sum, kinkin) => sum + (kinkin.food_pay || 0),
    0
  );

  return (
    <div>
      {/* ปรับขนาดและ padding ของ div หลักสำหรับมือถือ */}
      <div className="w-11/12 md:w-10/12 mx-auto border-gray-400 p-4 md:p-6 shadow-md mt-5 md:mt-20 rounded-lg">
        <h1 className="text-2xl font-bold text-center text-blue-700">
          Kinkun APP (Supabase)
        </h1>
        <h1 className="text-2xl font-bold text-center text-blue-700">
          ข้อมูลบันทึกการกิน
        </h1>
        <img src={food} alt="กินกัน" className="block mx-auto w-20 mt-5" />

        {/* ช่องค้นหาข้อมูล */}
        <div className="my-4">
          <input
            type="text"
            placeholder="ค้นหาชื่ออาหาร หรือสถานที่..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ปุ่มเพิ่มข้อมูลการกิน */}
        <div className="my-8 flex justify-end">
          <Link
            to="/addkinkun"
            className="bg-blue-700 p-3 rounded text-white hover:bg-blue-800 mt-5 inline-block"
          >
            เพิ่มข้อมูลการกิน
          </Link>
        </div>

        {/* ตารางแสดงข้อมูล - ใช้ filteredKinkins แทน kinkins */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center text-lg mt-4">กำลังโหลดข้อมูล...</p>
          ) : filteredKinkins.length === 0 && searchTerm === "" ? (
            <p className="text-center text-lg mt-4 text-gray-600">
              ยังไม่มีข้อมูลการกิน กรุณาเพิ่มข้อมูลใหม่
            </p>
          ) : filteredKinkins.length === 0 && searchTerm !== "" ? (
            <p className="text-center text-lg mt-4 text-gray-600">
              ไม่พบข้อมูลที่ตรงกับคำค้นหา "{searchTerm}"
            </p>
          ) : (
            <table className="w-full border border-gray-700 text-sm">
              <thead>
                <tr className="bg-gray-300">
                  <th className="border border-gray-700 p-2">รูป</th>
                  <th className="border border-gray-700 p-2">กินอะไร</th>
                  <th className="border border-gray-700 p-2">กินที่ไหน</th>
                  <th className="border border-gray-700 p-2">กินไปเท่าไหร่</th>
                  <th className="border border-gray-700 p-2">วันไหน</th>
                  <th className="border border-gray-700 p-2">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredKinkins.map((kinkin) => {
                  // ✅ เพิ่ม console.log เพื่อตรวจสอบค่า kinkin.id
                  console.log("Kinkin ID for edit link:", kinkin.id);
                  return (
                    <tr key={kinkin.id}>
                      <td className="border border-gray-700 p-2 text-center">
                        {kinkin.food_image_url === "" ||
                        kinkin.food_image_url === null ? (
                          "-"
                        ) : (
                          <img
                            src={kinkin.food_image_url}
                            alt="รูปอาหาร"
                            className="w-16 sm:w-20 mx-auto" // ปรับขนาดรูปภาพสำหรับมือถือ
                          />
                        )}
                      </td>
                      <td className="border border-gray-700 p-2">
                        {kinkin.food_name}
                      </td>
                      <td className="border border-gray-700 p-2">
                        {kinkin.food_where}
                      </td>
                      <td className="border border-gray-700 p-2">
                        {kinkin.food_pay}
                      </td>
                      <td className="border border-gray-700 p-2">
                        {kinkin.created_at
                          ? new Date(kinkin.created_at).toLocaleDateString("th-TH")
                          : ""}
                      </td>
                      <td className="border border-gray-700 p-2 text-center">
                        {/* ปุ่มแก้ไข */}
                        <Link
                          to="/editkinkun"
                          state={{ kinkin }} // ส่งข้อมูลทั้งก้อนไปหน้าแก้ไข
                          className="text-green-500 underline mx-2 cursor-pointer"
                        >
                          แก้ไข
                        </Link>
                        {/* ปุ่มลบ */}
                        <button
                          onClick={() =>
                            handleDelete(kinkin.id, kinkin.food_image_url)
                          }
                          className="text-red-500 underline mx-2 cursor-pointer"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* แสดงยอดรวมค่าใช้จ่าย */}
        {!loading && filteredKinkins.length > 0 && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-right font-bold text-blue-800">
            ยอดรวมค่าใช้จ่ายทั้งหมด:{" "}
            {totalFoodPay.toLocaleString("th-TH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            บาท
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
