import { useEffect, useState } from "react";
import {
  FaConciergeBell,
  FaClock,
  FaTag,
  FaUtensils,
  FaSpa,
  FaCar,
  FaBroom,
  FaSwimmer,
  FaHandsHelping,
} from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { getActiveExtraServicesApi } from "../../apis/api";

const HOTEL_AMENITIES = [
  {
    name: "Dining",
    description: "Enjoy freshly prepared meals, room service, and refreshments throughout your stay.",
    icon: FaUtensils,
  },
  {
    name: "Wellness",
    description: "Unwind with relaxing spa treatments and thoughtful ways to recharge.",
    icon: FaSpa,
  },
  {
    name: "Travel Help",
    description: "Make getting around easier with local travel guidance and transfer options.",
    icon: FaCar,
  },
  {
    name: "Housekeeping",
    description: "Count on a fresh, comfortable room and attentive help with everyday needs.",
    icon: FaBroom,
  },
  {
    name: "Pool & Fitness",
    description: "Keep your routine or take a refreshing break with recreational facilities.",
    icon: FaSwimmer,
  },
  {
    name: "Guest Assistance",
    description: "Get help with recommendations, requests, and the details of your visit.",
    icon: FaHandsHelping,
  },
];

const formatPrice = (price) =>
  `₹${Number(price ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatPriceType = (priceType) =>
  priceType
    ? priceType.toLowerCase().replaceAll("_", " ")
    : "per stay";

function ExtraServiceCard({ service }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <FaConciergeBell className="text-5xl text-amber-500" aria-hidden="true" />
        )}
        {service.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">
            {service.category}
          </span>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{service.name}</h2>
          <p className="mt-1 min-h-10 text-sm leading-relaxed text-slate-600">
            {service.description || "Available during your stay at Hotel Athitya."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <p className="font-bold text-amber-700">
            {formatPrice(service.price)}
            <span className="ml-1 text-xs font-medium capitalize text-slate-500">
              / {formatPriceType(service.priceType)}
            </span>
          </p>
          {service.taxRate != null && (
            <span className="text-xs text-slate-500">{service.taxRate}% tax</span>
          )}
        </div>

        {service.availability && (
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <FaClock className="text-amber-500" aria-hidden="true" />
            {service.availability}
          </p>
        )}
      </div>
    </article>
  );
}

export default function ExtraServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getActiveExtraServicesApi();
        if (isMounted) {
          const latestFirst = (Array.isArray(result) ? result : []).sort(
            (first, second) =>
              new Date(second.createdAt || 0).getTime() -
              new Date(first.createdAt || 0).getTime()
          );
          setServices(latestFirst);
        }
      } catch {
        if (isMounted) {
          setError("We couldn’t load extra services. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadServices();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-[70vh] bg-gradient-to-b from-amber-50/70 via-white to-white">
      <header className="relative overflow-hidden px-4 py-14 text-center sm:py-20">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-amber-700">
            <FaTag aria-hidden="true" />
            Make your stay even better
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Extra Services
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Explore the latest services and experiences available at Hotel Athitya.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
            <BiLoaderAlt className="animate-spin text-4xl text-amber-500" />
            <p>Loading extra services...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-10 text-center text-rose-700">
            {error}
          </div>
        ) : services.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {services.map((service) => (
              <ExtraServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <FaConciergeBell className="mx-auto text-4xl text-amber-500" aria-hidden="true" />
            <p className="mt-4 font-semibold text-slate-700">No extra services are available right now.</p>
          </div>
        )}
      </section>

      <section className="relative overflow-hidden border-t border-amber-100 bg-gradient-to-b from-white via-amber-50/60 to-orange-50/70 px-4 py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
              Thoughtful hospitality
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              More ways to enjoy your stay
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Hotels often make a stay special with helpful comforts, great food, and time to relax.
              Here are a few examples of services you may find during a hotel visit.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOTEL_AMENITIES.map(({ name, description, icon: Icon }) => (
              <article
                key={name}
                className="group flex items-start gap-4 rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-inner transition group-hover:scale-105">
                  <Icon className="text-xl" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Examples only. Services and availability vary by hotel.
          </p>
        </div>
      </section>
    </main>
  );
}
