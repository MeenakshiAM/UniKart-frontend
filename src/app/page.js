export default function Home() {
  return (
    <div className="flex flex-col gap-16 px-6 py-10">

      {/* 🔥 HERO SECTION */}
      <section className="text-center mt-10">
        <h1 className="text-5xl font-bold mb-4">
          UniKart 🚀
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Buy, Sell & Offer Services inside your campus
        </p>

        <div className="flex justify-center gap-4">
          <a href="/products" className="px-6 py-3 bg-orange-500 text-white rounded-lg">
            Explore Products
          </a>
          <a href="/become-seller" className="px-6 py-3 border rounded-lg">
            Start Selling
          </a>
        </div>
      </section>

      {/* 🧩 FEATURES */}
      <section className="grid md:grid-cols-3 gap-6 text-center">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">🛒 Products</h2>
          <p className="text-gray-600">
            Buy and sell items within your campus easily
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">🧑‍🔧 Services</h2>
          <p className="text-gray-600">
            Offer skills like tutoring, design, repairs & more
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">🔒 Safe & Verified</h2>
          <p className="text-gray-600">
            Student-based system with secure transactions
          </p>
        </div>
      </section>

      {/* ⚙️ HOW IT WORKS */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-6">How it works</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold">1. Sign Up</h3>
            <p className="text-gray-600">Create your account</p>
          </div>

          <div>
            <h3 className="font-semibold">2. Explore / List</h3>
            <p className="text-gray-600">Browse or add products</p>
          </div>

          <div>
            <h3 className="font-semibold">3. Connect</h3>
            <p className="text-gray-600">Buy or sell within campus</p>
          </div>
        </div>
      </section>

      {/* ❓ FAQ */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">FAQ</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Is UniKart free?</h3>
            <p className="text-gray-600">Yes, free for students.</p>
          </div>

          <div>
            <h3 className="font-semibold">Who can sell?</h3>
            <p className="text-gray-600">Any registered student.</p>
          </div>

          <div>
            <h3 className="font-semibold">Are transactions safe?</h3>
            <p className="text-gray-600">
              Yes, with moderation and verification system.
            </p>
          </div>
        </div>
      </section>

      {/* 🚀 CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to start?
        </h2>

        <a
          href="/login"
          className="px-6 py-3 bg-orange-500 text-white rounded-lg"
        >
          Join UniKart
        </a>
      </section>

    </div>
  );
}