import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { vehicles } from "@/features/dealer/staff/page/vehicles";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const idNum = id ? parseInt(id, 10) : NaN;
  const vehicle = vehicles.find((v) => v.id === idNum);

  const [mainImage, setMainImage] = useState<string | undefined>(undefined);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);

  useEffect(() => {
    if (vehicle) {
      const imgs = vehicle.gallery && vehicle.gallery.length > 0 ? vehicle.gallery : [vehicle.image];
      setSelectedColorIdx(0);
      setMainImage(imgs[0]);
    }
  }, [vehicle]);

  if (!vehicle) return <p className="text-center text-gray-500">Vehicle not found</p>;

  return (
    <div className="p-6">
  <div className="text-center text-2xl font-bold py-3 mb-6">Vehicle Details</div>

      <div className="mb-4">
        <Link to="/dealer/staff/vehicles" className="text-blue-600 hover:underline">
          ← Back to Catalog
        </Link>
      </div>
      <div className="relative bg-white overflow-hidden rounded-lg mb-6">
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
          <span className="text-gray-200 font-extrabold text-[8rem] md:text-[10rem] opacity-30 select-none">
            {vehicle.name.split(" ").pop()}
          </span>
        </div>

        <div className="absolute top-6 right-6">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full shadow">
            + CREATE QUOTATION
          </button>
        </div>

        <div className="flex justify-center items-center pt-8 pb-6">
          {mainImage && (
            <img src={mainImage} alt={vehicle.name} className="w-full max-w-4xl object-contain" />
          )}
        </div>

        <div className="flex flex-col items-center pb-6">
          <h2 className="text-2xl font-bold tracking-widest">{vehicle.name.toUpperCase()}</h2>

          <div className="flex items-center justify-center mt-4 space-x-3">
            {(vehicle.colors && vehicle.colors.length > 0
              ? vehicle.colors.map((c) => c.image)
              : (vehicle.gallery && vehicle.gallery.length > 0 ? vehicle.gallery : [vehicle.image])
            ).map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedColorIdx(idx);
                  setMainImage(img);
                }}
                className={`w-10 h-10 rounded-full border-2 ${selectedColorIdx === idx ? 'border-blue-600' : 'border-gray-200'} overflow-hidden`}
                style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                aria-label={`color-${idx}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t">
        <div className="grid grid-cols-3 gap-0 text-sm text-gray-700">
          <div className="p-6 bg-white border-r">
            <p className="text-gray-500">Dài x rộng x Cao (mm)</p>
            <p className="font-medium mt-1">3967 x 1723 x 1579</p>

            <p className="text-gray-500 mt-3">Bộ sạc tại nhà (kW)</p>
            <p className="mt-1">{vehicle.battery ?? "-"}</p>

            <p className="text-gray-500 mt-3">Thời gian nạp pin</p>
            <p className="mt-1">33 phút (10%-70%)</p>

            <p className="text-gray-500 mt-3">Hệ thống phanh (trước/sau)</p>
            <p className="mt-1">Đĩa/Đĩa</p>
          </div>

          <div className="p-6 bg-white border-r">
            <p className="text-gray-500">Chiều dài cơ sở</p>
            <p className="font-medium mt-1">2514 mm</p>

            <p className="text-gray-500 mt-3">Quãng đường</p>
            <p className="mt-1">{vehicle.range}</p>

            <p className="text-gray-500 mt-3">Dẫn động</p>
            <p className="mt-1">FWD/Cầu trước</p>

            <p className="text-gray-500 mt-3">Kích thước la-zăng</p>
            <p className="mt-1">16 inch</p>
          </div>

          <div className="p-6 bg-white">
            <p className="text-gray-500">Khoảng sáng gầm xe</p>
            <p className="font-medium mt-1">160 mm</p>

            <p className="text-gray-500 mt-3">Công suất tối đa</p>
            <p className="mt-1">{vehicle.power ?? "-"}</p>

            <p className="text-gray-500 mt-3">Đèn chiếu sáng phía trước</p>
            <p className="mt-1">Bi-halogen, projector</p>

            <p className="text-gray-500 mt-3">Ghế lái</p>
            <p className="mt-1">Chỉnh cơ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
