const stats = [
  { value: "10,000+", label: "Devices Repaired" },
  { value: "4.9/5", label: "Customer Rating" },
  { value: "10+ Years", label: "of Experience" },
  { value: "PAN India", label: "Sales & Shipping" },
];

export default function Stats() {
  return (
    <section className="bg-blue-700">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-extrabold text-white sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm font-medium text-blue-100">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
