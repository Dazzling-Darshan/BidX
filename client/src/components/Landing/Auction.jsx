import { FaClock, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router";
import { useGetAuctions } from "../../hooks/useAuction.js";

const fallbackAuctions = [
  {
    _id: "demo-1",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    title: "Minimalist Chronograph Watch",
    category: "Jewelry",
    price: "Rs 4,500",
    bids: 18,
    time: "2h 15m",
    color: "bg-rose-500",
  },
  {
    _id: "demo-2",
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
    title: "Vintage 35mm Rangefinder Camera",
    category: "Collectibles",
    price: "Rs 8,200",
    bids: 24,
    time: "5h 42m",
    color: "bg-amber-500",
  },
  {
    _id: "demo-3",
    img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
    title: "Contemporary Abstract Canvas",
    category: "Art",
    price: "Rs 12,000",
    bids: 9,
    time: "1d 3h",
    color: "bg-emerald-500",
  },
];

export const Auction = () => {
  const { data } = useGetAuctions(1, "all", "", "endingSoon", "active");
  const liveAuctions = data?.auctions || [];

  const displayItems =
    liveAuctions.length >= 3
      ? liveAuctions.slice(0, 3).map((item) => {
          const timeLeftMs = Math.max(0, new Date(item.itemEndDate) - new Date());
          const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
          const mins = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
          return {
            _id: item._id,
            img: item.itemPhoto || "https://picsum.photos/400",
            title: item.itemName,
            category: item.itemCategory,
            price: `Rs ${item.currentPrice || item.startingPrice}`,
            bids: item.bidsCount || 0,
            time: hours > 24 ? `${Math.floor(hours / 24)}d left` : `${hours}h ${mins}m`,
            color: hours < 4 ? "bg-rose-500" : "bg-emerald-500",
          };
        })
      : fallbackAuctions;

  return (
    <section className="py-20 sm:py-24 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-wider">
                Trending Live Now
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Featured Auctions
            </h2>
          </div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
          >
            Explore all <FaChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <Link
              key={item._id}
              to="/signup"
              className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-indigo-200 overflow-hidden transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {item.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`${item.color} text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm inline-flex items-center gap-1`}
                  >
                    <FaClock className="h-2.5 w-2.5" />
                    {item.time}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Verified Seller &bull; Free Buyer Protection
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                      Current Bid
                    </span>
                    <span className="text-lg font-black text-gray-900 tabular-nums">
                      {item.price}
                    </span>
                  </div>
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Bid Now &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
