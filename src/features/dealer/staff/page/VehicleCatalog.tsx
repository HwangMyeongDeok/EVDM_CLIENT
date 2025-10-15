import { vehicles } from "@/features/dealer/staff/page/vehicles";
import { Link } from "react-router-dom";

function seatsForType(type: string) {
  const t = type.toLowerCase();
  if (t.includes("mini")) return "4 Chỗ";
  if (t.includes("full")) return "6-7 Chỗ";
  return "5 Chỗ";
}

export default function VehicleCatalog() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vehicle Catalog</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicles.map((v) => {
          const code = v.name.split(" ").pop();
          return (
            <div
              key={v.id}
              className="relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100"
            >
              {/* Watermark large code behind */}
              <div className="absolute inset-x-0 top-2 flex justify-center pointer-events-none">
                <span className="text-gray-200 font-extrabold text-6xl md:text-7xl opacity-30">
                  {code}
                </span>
              </div>

              {/* Small centered image */}
              <div className="w-full h-28 bg-transparent flex items-center justify-center pt-6">
                <img
                  src={v.image}
                  alt={v.name}
                  className="max-w-70 max-h-40 md:max-h-50 object-contain block"
                />
              </div>

              <div className="px-5 pb-5 pt-3">
                <h3 className="font-semibold text-lg">{v.name}</h3>

                <hr className="my-3 border-gray-200" />

                <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm text-gray-700">
                  <div className="text-gray-500">Dòng Xe:</div>
                  <div>{v.type}</div>

                  <div className="text-gray-500">Số Chỗ Ngồi:</div>
                  <div>{seatsForType(v.type)}</div>

                  <div className="text-gray-500">Quãng Đường Lên Tới:</div>
                  <div>{v.range}</div>

                  <div className="text-gray-500">Giá:</div>
                  <div className="font-semibold">{v.price}</div>
                </div>

                <div className="flex justify-center mt-4">
                  <Link
                    to={`/dealer/staff/vehicles/${v.id}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-full inline-block text-center"
                  >
                    View Detail
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
