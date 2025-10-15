import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { vehicles } from "@/features/dealer/staff/page/vehicles";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const idNum = id ? parseInt(id, 10) : NaN;
  const vehicle = vehicles.find((v) => v.id === idNum);

  const [mainImage, setMainImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (vehicle) setMainImage(vehicle.image);
  }, [vehicle]);

  if (!vehicle) return <p className="text-center text-gray-500">Vehicle not found</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/dealer/staff/vehicles" className="text-blue-600 hover:underline">
          ← Back to Catalog
        </Link>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700">
            Create Quotation
          </button>
        </div>
      </div>

      {/* Title + Price */}
      <div className="mb-4">
  <h1 className="text-2xl font-semibold">{vehicle.name}</h1>
        <p className="text-green-600 font-medium">In Stock</p>
        <p className="text-blue-600 font-bold text-xl">{vehicle.price}</p>
      </div>

      {/* Image Gallery */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        {mainImage && (
          <img
            src={mainImage}
            alt={vehicle.name}
            className="w-full h-72 object-cover rounded-xl mb-4"
          />
        )}
        <div className="flex gap-3">
              {[vehicle.image].map((img: string, idx: number) => (
            <img
              key={idx}
              src={img}
                  alt={`${vehicle.name} ${idx}`}
              onClick={() => setMainImage(img)}
              className={`w-20 h-16 object-cover rounded-lg cursor-pointer border-2 ${
                mainImage === img ? "border-blue-600" : "border-transparent"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Specifications + Promotions + Actions */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="col-span-2">
          <h2 className="text-xl font-semibold mb-3">Specifications</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-700 bg-white p-4 rounded-xl shadow">
            <div>
              <p><strong>Type:</strong> {vehicle.type}</p>
              <p><strong>Range:</strong> {vehicle.range}</p>
            </div>
            <div>
              <p><strong>Seats:</strong> {vehicle.type.toLowerCase().includes("mini") ? "4" : "5"}</p>
              <p><strong>---</strong></p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-4">
          {vehicle.promotions && (
            <div className="bg-green-50 p-4 rounded-xl shadow border border-green-200">
              <h3 className="font-semibold text-green-700 mb-1">Available Promotion</h3>
              <p className="text-gray-700">{vehicle.promotions.name}</p>
              <p className="text-green-700 font-semibold mt-1">
                {vehicle.promotions.value} off
              </p>
              <p className="text-sm text-gray-500">
                Valid until {vehicle.promotions.validUntil}
              </p>
            </div>
          )}

          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg mb-2 hover:bg-blue-700">
              Schedule Test Drive
            </button>
            <button className="w-full border py-2 rounded-lg mb-2">
              Request More Info
            </button>
            <button className="w-full border py-2 rounded-lg">
              Calculate Financing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
