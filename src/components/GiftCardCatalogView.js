import React, { useState, useEffect } from 'react';
import { storeService } from '../services/adminService';
import {
  Tag,
  ChevronRight,
  ShoppingBag,
  Coins,
  Info,
  Eye,
  ArrowRight,
  BookOpen,
  FileText,
  Gift,
  ArrowLeft,
  Store
} from 'lucide-react';

const getBrandGradient = (brandName) => {
  const name = (brandName || '').toLowerCase();
  if (name.includes('amazon')) return 'linear-gradient(135deg, #232f3e 0%, #146eb4 100%)';
  if (name.includes('flipkart')) return 'linear-gradient(135deg, #2874f0 0%, #004ba0 100%)';
  if (name.includes('myntra')) return 'linear-gradient(135deg, #fe3f6c 0%, #e7184a 100%)';
  if (name.includes('swiggy')) return 'linear-gradient(135deg, #fc8019 0%, #d45e0c 100%)';
  if (name.includes('zomato')) return 'linear-gradient(135deg, #cb202d 0%, #9a101b 100%)';
  if (name.includes('nykaa')) return 'linear-gradient(135deg, #fc2779 0%, #c40a50 100%)';
  if (name.includes('google')) return 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)';
  if (name.includes('ajio')) return 'linear-gradient(135deg, #2d3e50 0%, #1e293b 100%)';

  const colors = [
    ['#6D28D9', '#8B5CF6'],
    ['#0D9488', '#14B8A6'],
    ['#4F46E5', '#818CF8'],
    ['#0284C7', '#38BDF8'],
    ['#059669', '#34D399'],
    ['#DB2777', '#F472B6']
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  const pair = colors[sum % colors.length];
  return `linear-gradient(135deg, ${pair[0]} 0%, ${pair[1]} 100%)`;
};

const getGiftCardImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseHost = 'https://api.shoptosave.in';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseHost}${cleanPath}`;
};

let lastFetchTime = 0;

const GiftCardCatalogView = ({ triggerToast }) => {
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = Buy Catalog, 1 = Sell Catalog

  const [selectedCard, setSelectedCard] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await storeService.getGiftCards();
      if (response && response.success && response.result && response.result.data) {
        const fetchedCards = Array.isArray(response.result.data)
          ? response.result.data
          : (response.result.data.giftCards || []);
        const mappedCards = fetchedCards.map((card) => {
          const mainCategory = card.category_name || 'General';

          // Safely parse discounts JSON or string
          let discountsArr = [];
          if (card.discounts) {
            if (Array.isArray(card.discounts)) {
              discountsArr = card.discounts;
            } else if (typeof card.discounts === 'string') {
              try {
                discountsArr = JSON.parse(card.discounts);
              } catch (e) {
                const num = parseFloat(card.discounts);
                if (!isNaN(num)) {
                  discountsArr = [num];
                }
              }
            }
          }

          // Priority: API offer data (most specific) > cashback_percentage > discounts array > NA
          let buyDiscount = 'NA';
          let offerTypeLabel = '';
          if (card.max_offer_value && parseFloat(card.max_offer_value) > 0) {
            offerTypeLabel = card.max_offer_type === 1 ? 'Discount' : 'Cashback';
            buyDiscount = card.max_offer_value_type === 2
              ? `${parseFloat(card.max_offer_value)}%`
              : `₹${parseFloat(card.max_offer_value)}`;
          } else if (card.cashback_percentage !== undefined && card.cashback_percentage !== null && parseFloat(card.cashback_percentage) > 0) {
            buyDiscount = `${parseFloat(card.cashback_percentage)}%`;
            offerTypeLabel = 'Cashback';
          } else if (discountsArr.length > 0) {
            buyDiscount = `${discountsArr[0]}%`;
            offerTypeLabel = 'Discount';
          }

          // Sell payout rate from resell_margin
          const sellPayout = card.payout_enabled === 1
            ? (card.resell_margin !== undefined && card.resell_margin !== null
                ? `${(100 - parseFloat(card.resell_margin)).toFixed(1)}%`
                : '90.0%')
            : 'N/A';

          return {
            id: card.id,
            brand: card.gift_card_name || card.brand_name || 'N/A',
            category: mainCategory,
            allCategories: [],
            allowBuy: true,
            allowSell: card.payout_enabled === 1,
            buyDiscount,
            offerTypeLabel,
            sellPayout,
            status: card.status === 1 ? 'Active' : 'Disabled',
            stock: card.stock || (100 + (card.id % 5) * 20),
            bg: getBrandGradient(card.gift_card_name || card.brand_name),
            raw: card,
          };
        });
        setCatalog(mappedCards);
      } else {
        triggerToast(response?.message || 'Failed to fetch gift cards', 'error');
      }
    } catch (err) {
      console.error('Error fetching catalog data:', err);
      triggerToast(err.message || 'An error occurred while fetching the gift card catalog', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetchTime > 500) {
      lastFetchTime = now;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatusVal = currentStatus === 'Active' ? 0 : 1;
    const nextStatusText = currentStatus === 'Active' ? 'Disabled' : 'Active';
    try {
      const response = await storeService.updateGiftCardStatus(id, nextStatusVal);
      if (response && response.success) {
        setCatalog(
          catalog.map((c) => {
            if (c.id === id) {
              triggerToast(`"${c.brand}" status updated to ${nextStatusText}`, 'success');
              return { ...c, status: nextStatusText };
            }
            return c;
          })
        );
        setSelectedCard((prev) =>
          prev && prev.id === id ? { ...prev, status: nextStatusText } : prev
        );
      } else {
        triggerToast(response?.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      let errorMsg = err.message || 'An error occurred while updating status';
      if (err.data && err.data.message) {
        errorMsg = err.data.message;
      }
      triggerToast(errorMsg, 'error');
    }
  };

  const filteredCatalog = catalog.filter((card) => {
    const matchesTab = activeTab === 0 ? card.allowBuy : card.allowSell;
    return matchesTab;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[450px] w-full">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (selectedCard) {
    return (
      <div className="w-full max-w-full box-border animate-fadeIn pt-4">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setSelectedCard(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Preview card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div
              className="w-full h-44 rounded-2xl text-white flex flex-col justify-end shadow-md relative overflow-hidden border border-slate-200/80"
              style={{
                background: selectedCard?.raw?.giftcard_image
                  ? `url(${getGiftCardImageUrl(selectedCard.raw.giftcard_image)}) no-repeat center/cover`
                  : (selectedCard?.bg || 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)')
              }}
            >
              {selectedCard?.raw?.giftcard_image && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-0" />
              )}
              <div className="p-6 relative z-10">
                <h3 className="font-extrabold text-lg leading-tight drop-shadow-sm">
                  {selectedCard?.raw?.gift_card_name || selectedCard?.brand}
                </h3>
                <p className="text-[10px] font-bold opacity-85 mt-1 uppercase tracking-wide">
                  {selectedCard?.raw?.store_name || 'Gift Card'}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </span>
                <span className="text-xs font-bold text-primary">
                  {selectedCard.category}
                </span>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Status
                </span>
                <button
                  onClick={() => handleToggleStatus(selectedCard.id, selectedCard.status)}
                  className={`text-xs font-bold transition-all active:scale-95 hover:underline block w-fit ${
                    selectedCard.status === 'Active' ? 'text-emerald-650' : 'text-red-650'
                  }`}
                >
                  {selectedCard.status === 'Active' ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Full specs */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Gift Card Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  <FileText className="w-4 h-4 text-pink-500" />
                  Card Type
                </span>
                <span className="text-sm font-bold text-slate-800 uppercase">
                  {selectedCard.raw.product_type?.replace('-', ' ') || 'e-gift-card'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  <Tag className="w-4 h-4 text-violet-500" />
                  Brand Name
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedCard.raw.brand_name || 'N/A'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  <Store className="w-4 h-4 text-indigo-500" />
                  Store Name
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedCard.raw.store_name || 'N/A'}
                </span>
              </div>
            </div>

            {selectedCard.raw.short_description && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Short Description
                </span>
                <p className="text-xs text-slate-650 bg-slate-50 p-4 border-l-4 border-primary rounded-r-xl leading-relaxed whitespace-pre-line">
                  {selectedCard.raw.short_description}
                </p>
              </div>
            )}

            {selectedCard.raw.description && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Product Description
                </span>
                <p className="text-xs text-slate-650 bg-slate-50 p-4 border-l-4 border-indigo-500 rounded-r-xl leading-relaxed">
                  {selectedCard.raw.description}
                </p>
              </div>
            )}

            {!selectedCard.raw.description && !selectedCard.raw.short_description && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Product Description
                </span>
                <p className="text-xs text-slate-650 bg-slate-50 p-4 border-l-4 border-primary rounded-r-xl leading-relaxed">
                  No description available for this gift card.
                </p>
              </div>
            )}

            {selectedCard.raw.redeem_steps && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Steps To Redeem
                </span>
                <div
                  className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-xs text-slate-650 leading-relaxed
                  [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-1.5 [&_a]:text-primary [&_a]:font-bold hover:[&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: selectedCard.raw.redeem_steps }}
                />
              </div>
            )}

            {selectedCard.raw.things_to_note && (
              <div className="p-4 bg-amber-50/50 border-l-4 border-amber-500 rounded-r-xl">
                <span className="text-[10px] font-bold text-amber-600 block mb-0.5">IMPORTANT NOTES</span>
                <p className="text-xs text-amber-850 leading-relaxed font-semibold">
                  {selectedCard.raw.things_to_note}
                </p>
              </div>
            )}

            {selectedCard.raw.tnc_link && (
              <a
                href={selectedCard.raw.tnc_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#6D28D9] hover:text-[#5B21B6] text-xs font-bold w-fit hover:underline pt-2"
              >
                View Official Terms & Conditions Link
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full box-border animate-fadeIn pt-4">
      {/* Main Mode Switcher Tab Bar */}
      <div className="border-b border-slate-200/80 mb-6 flex justify-between items-center">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab(0)}
            className={`flex items-center gap-2 px-6 pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 0
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Buy Gift Cards
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {filteredCatalog.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white">
            <Gift className="w-12 h-12 text-slate-300 opacity-50 mb-3" />
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              No Gift Cards Available
            </h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {activeTab === 0
                ? "There are currently no active purchase gift cards registered in this catalog."
                : "There are currently no active sell gift cards registered in this catalog."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-100">
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 pl-6">Gift Card Brand</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Category</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">SKU</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Denominations</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Validity</th>
                  {activeTab === 0 ? (
                    <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Discount %</th>
                  ) : (
                    <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Platform Payout Rate</th>
                  )}
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center">Status</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCatalog.map((card) => {
                  const isLive = card.status === 'Active';
                  return (
                    <tr
                      key={card.id}
                      className="hover:bg-violet-50/10 transition-colors"
                    >
                      <td className="px-6 py-4 pl-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {card.raw?.giftcard_image ? (
                            <img
                              src={getGiftCardImageUrl(card.raw.giftcard_image)}
                              alt={card.brand}
                              className="w-11 h-7 rounded object-cover bg-white border shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-11 h-7 rounded flex items-center justify-center text-white shadow-sm flex-shrink-0"
                              style={{ background: card.bg }}
                            >
                              <Gift className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="text-xs font-bold text-slate-800">{card.brand}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-primary">
                          {card.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-semibold text-slate-600">
                        {card.raw?.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                        {card.raw?.currency_symbol || '₹'}{parseFloat(card.raw?.min_denomination || 0).toFixed(0)} - {card.raw?.currency_symbol || '₹'}{parseFloat(card.raw?.max_denomination || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-650">
                        {card.raw?.validity || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-extrabold">
                        {activeTab === 0 ? (
                          card.buyDiscount === 'NA' ? (
                            <span className="text-slate-400 font-semibold">NA</span>
                          ) : (
                            <span className="text-primary">
                              {card.buyDiscount} <span className="text-[10px] font-bold text-slate-400">{card.offerTypeLabel}</span>
                            </span>
                          )
                        ) : (
                          <span className="text-emerald-500">{card.sellPayout} Payout</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(card.id, card.status)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            isLive
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-600 border-red-500/10 hover:bg-red-100'
                          }`}
                        >
                          {isLive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right pr-6 whitespace-nowrap">
                        <button
                          onClick={async () => {
                            try {
                              const response = await storeService.getGiftCardById(card.id);
                              if (response && response.success && response.result?.data) {
                                const fullCard = response.result.data;
                                const mainCategory = fullCard.category_name || 'General';

                                // Safely parse discounts JSON or string
                                let discountsArr = [];
                                if (fullCard.discounts) {
                                  if (Array.isArray(fullCard.discounts)) {
                                    discountsArr = fullCard.discounts;
                                  } else if (typeof fullCard.discounts === 'string') {
                                    try {
                                      discountsArr = JSON.parse(fullCard.discounts);
                                    } catch (e) {
                                      const num = parseFloat(fullCard.discounts);
                                      if (!isNaN(num)) {
                                        discountsArr = [num];
                                      }
                                    }
                                  }
                                }

                                // Priority: API offer data > cashback_percentage > discounts array > NA
                                let buyDiscount = 'NA';
                                let offerTypeLabel = '';
                                if (fullCard.max_offer_value && parseFloat(fullCard.max_offer_value) > 0) {
                                  offerTypeLabel = fullCard.max_offer_type === 1 ? 'Discount' : 'Cashback';
                                  buyDiscount = fullCard.max_offer_value_type === 2
                                    ? `${parseFloat(fullCard.max_offer_value)}%`
                                    : `₹${parseFloat(fullCard.max_offer_value)}`;
                                } else if (fullCard.cashback_percentage !== undefined && fullCard.cashback_percentage !== null && parseFloat(fullCard.cashback_percentage) > 0) {
                                  buyDiscount = `${parseFloat(fullCard.cashback_percentage)}%`;
                                  offerTypeLabel = 'Cashback';
                                } else if (discountsArr.length > 0) {
                                  buyDiscount = `${discountsArr[0]}%`;
                                  offerTypeLabel = 'Discount';
                                }

                                // Sell payout rate from resell_margin
                                const sellPayout = fullCard.payout_enabled === 1
                                  ? (fullCard.resell_margin !== undefined && fullCard.resell_margin !== null
                                      ? `${(100 - parseFloat(fullCard.resell_margin)).toFixed(1)}%`
                                      : '90.0%')
                                  : 'N/A';

                                setSelectedCard({
                                  id: fullCard.id,
                                  brand: fullCard.gift_card_name || fullCard.brand_name || 'N/A',
                                  category: mainCategory,
                                  allCategories: [],
                                  allowBuy: true,
                                  allowSell: fullCard.payout_enabled === 1,
                                  buyDiscount,
                                  offerTypeLabel,
                                  sellPayout,
                                  status: fullCard.status === 1 ? 'Active' : 'Disabled',
                                  stock: fullCard.stock || (100 + (fullCard.id % 5) * 20),
                                  bg: getBrandGradient(fullCard.gift_card_name || fullCard.brand_name),
                                  raw: fullCard,
                                });
                              } else {
                                triggerToast(response?.message || 'Failed to fetch gift card details', 'error');
                              }
                            } catch (err) {
                              console.error('Error fetching gift card details:', err);
                              triggerToast('Error loading gift card details', 'error');
                            }
                          }}
                          className="flex items-center justify-center border border-primary/30 text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-colors ml-auto"
                          title="Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardCatalogView;
