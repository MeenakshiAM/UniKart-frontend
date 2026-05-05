export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      
      <h1 className="text-4xl font-bold mb-4">
        Welcome to UniKart 🚀
      </h1>

      <p className="text-gray-600 mb-6">
        Buy and sell within your campus easily
      </p>

      <div className="flex gap-4">
        <a href="/products" className="px-4 py-2 bg-orange-500 text-white rounded">
          Browse Products
        </a>

        <a href="/become-seller" className="px-4 py-2 border rounded">
          Start Selling
        </a>
      </div>

    </div>
  );
}