import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { categoryService } from '../services/categoryService';
import {
  Tag,
  ChevronRight,
  ShoppingBag,
  Coins,
  Info,
  ArrowRight,
  BookOpen,
  FileText,
  Gift
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

const initialCards = [
  { id: 1, brand: 'Amazon', category: 'Shopping', allowBuy: true, allowSell: true, buyDiscount: '3.5%', sellPayout: '90.0%', status: 'Active', stock: 120, bg: 'linear-gradient(135deg, #232f3e 0%, #146eb4 100%)' },
  { id: 2, brand: 'Flipkart', category: 'Shopping', allowBuy: true, allowSell: true, buyDiscount: '4.0%', sellPayout: '91.0%', status: 'Active', stock: 85, bg: 'linear-gradient(135deg, #2874f0 0%, #004ba0 100%)' },
  { id: 3, brand: 'Myntra', category: 'Lifestyle', allowBuy: true, allowSell: true, buyDiscount: '6.5%', sellPayout: '88.0%', status: 'Active', stock: 64, bg: 'linear-gradient(135deg, #fe3f6c 0%, #e7184a 100%)' },
  { id: 4, brand: 'Swiggy', category: 'Food', allowBuy: true, allowSell: true, buyDiscount: '5.0%', sellPayout: '89.5%', status: 'Active', stock: 110, bg: 'linear-gradient(135deg, #fc8019 0%, #d45e0c 100%)' },
  { id: 5, brand: 'Zomato', category: 'Food', allowBuy: true, allowSell: true, buyDiscount: '5.5%', sellPayout: '89.0%', status: 'Active', stock: 95, bg: 'linear-gradient(135deg, #cb202d 0%, #9a101b 100%)' },
  { id: 6, brand: 'Nykaa', category: 'Beauty', allowBuy: true, allowSell: true, buyDiscount: '4.5%', sellPayout: '87.5%', status: 'Active', stock: 42, bg: 'linear-gradient(135deg, #fc2779 0%, #c40a50 100%)' },
  { id: 7, brand: 'Google Play', category: 'Entertainment', allowBuy: true, allowSell: false, buyDiscount: '2.5%', sellPayout: 'N/A', status: 'Active', stock: 200, bg: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)' },
  { id: 8, brand: 'Ajio', category: 'Lifestyle', allowBuy: true, allowSell: true, buyDiscount: '7.0%', sellPayout: '86.0%', status: 'Disabled', stock: 0, bg: 'linear-gradient(135deg, #2d3e50 0%, #1e293b 100%)' },
];

let lastFetchTime = 0;

const GiftCardCatalogView = ({ triggerToast }) => {
  const [catalog, setCatalog] = useState(initialCards);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = Buy Catalog, 1 = Sell Catalog

  // View details dialog state
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let categoriesList = [];
      try {
        const catRes = await categoryService.getCategories();
        if (catRes && catRes.success && catRes.result && catRes.result.data) {
          categoriesList = catRes.result.data;
        }
      } catch (catErr) {
        console.error('Failed to fetch categories:', catErr);
      }

      const response = await storeService.getGiftCards();
      if (response && response.success && response.result && response.result.data) {
        const fetchedCards = Array.isArray(response.result.data)
          ? response.result.data
          : (response.result.data.giftCards || []);
        const mappedCards = fetchedCards.map((card) => {
          const catNames = (card.categories || []).map(catId => {
            const matchedCat = categoriesList.find(c => String(c.id) === String(catId));
            return matchedCat ? matchedCat.category_name : null;
          }).filter(Boolean);

          const mainCategory = card.category_name || (catNames.length > 0 ? catNames[0] : 'General');

          return {
            id: card.id,
            brand: card.gift_card_name || card.brand_name || 'N/A',
            category: mainCategory,
            allCategories: catNames,
            allowBuy: true,
            allowSell: card.payout_enabled === 1,
            buyDiscount: card.discounts && card.discounts.length > 0 ? `${card.discounts[0]}%` : '3.5%',
            sellPayout: card.payout_enabled === 1 ? '90.0%' : 'N/A',
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
                  {activeTab === 0 ? (
                    <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Max Cashback Offer</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-extrabold">
                        {activeTab === 0 ? (
                          <span className="text-primary">{card.buyDiscount} OFF</span>
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
                          onClick={() => {
                            setSelectedCard(card);
                            setOpenDetailsDialog(true);
                          }}
                          className="flex items-center gap-1.5 border border-primary/30 text-primary hover:bg-primary/5 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ml-auto"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Details
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

      {/* POPUP: Gift Card Details Popup */}
      {openDetailsDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            {/* Gradient Header */}
            <div
              className="p-6 text-white relative flex-shrink-0"
              style={{ background: selectedCard?.bg || 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)' }}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  {selectedCard?.raw?.giftcard_image ? (
                    <img
                      src={getGiftCardImageUrl(selectedCard.raw.giftcard_image)}
                      alt={selectedCard.brand}
                      className="w-12 h-12 rounded-lg object-cover bg-white p-0.5 border-2 border-white shadow-md"
                    />
                  ) : selectedCard?.raw?.brand_logo ? (
                    <img
                      src={selectedCard.raw.brand_logo}
                      alt={selectedCard.brand}
                      className="w-12 h-12 rounded-full object-cover bg-white p-0.5 border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-md">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-base leading-tight drop-shadow-sm">
                      {selectedCard?.raw?.gift_card_name || selectedCard?.brand}
                    </h3>
                    <p className="text-[10px] font-bold opacity-85 mt-0.5 uppercase tracking-wide">
                      {selectedCard?.raw?.brand_name || 'Gift Card'} • {selectedCard?.raw?.brand_code || 'N/A'}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                  selectedCard?.status === 'Active'
                    ? 'bg-emerald-500/25 border-emerald-500/35 text-white'
                    : 'bg-white/20 border-white/30 text-white'
                }`}>
                  {selectedCard?.status === 'Active' ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Scrollable details content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-white">
              {selectedCard?.raw && (
                <div className="space-y-5">
                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                        Denominations
                      </span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {selectedCard.raw.currency_symbol || '₹'}{parseFloat(selectedCard.raw.min_denomination).toFixed(0)} - {selectedCard.raw.currency_symbol || '₹'}{parseFloat(selectedCard.raw.max_denomination).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        Validity
                      </span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {selectedCard.raw.validity || 'N/A'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <Tag className="w-3.5 h-3.5 text-blue-500" />
                        SKU Code
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {selectedCard.raw.sku || 'N/A'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <FileText className="w-3.5 h-3.5 text-pink-500" />
                        Card Type
                      </span>
                      <span className="text-xs font-bold text-slate-800 uppercase">
                        {selectedCard.raw.product_type?.replace('-', ' ') || 'e-gift-card'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Product Description
                    </span>
                    <p className="text-xs text-slate-650 bg-slate-50 p-4 border-l-4 border-primary rounded-r-xl leading-relaxed">
                      {selectedCard.raw.description || selectedCard.raw.short_description || 'No description available for this gift card.'}
                    </p>
                  </div>

                  {/* Redemption steps */}
                  {selectedCard.raw.redeem_steps && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Steps To Redeem
                      </span>
                      <div
                        className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-xs text-slate-650 max-h-[160px] overflow-y-auto leading-relaxed
                        [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-1.5 [&_a]:text-primary [&_a]:font-bold hover:[&_a]:underline"
                        dangerouslySetInnerHTML={{ __html: selectedCard.raw.redeem_steps }}
                      />
                    </div>
                  )}

                  {/* Important Notes */}
                  {selectedCard.raw.things_to_note && (
                    <div className="p-3 bg-amber-50/50 border-l-4 border-amber-500 rounded-r-xl">
                      <span className="text-[10px] font-bold text-amber-600 block mb-0.5">IMPORTANT NOTES</span>
                      <p className="text-[11px] text-amber-850 leading-relaxed font-semibold">
                        {selectedCard.raw.things_to_note}
                      </p>
                    </div>
                  )}

                  {/* T&C Link */}
                  {selectedCard.raw.tnc_link && (
                    <a
                      href={selectedCard.raw.tnc_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#6D28D9] hover:text-[#5B21B6] text-xs font-bold w-fit hover:underline"
                    >
                      View Official Terms & Conditions Link
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setOpenDetailsDialog(false)}
                className="w-full py-2.5 text-xs font-bold text-white bg-primary hover:bg-[#5B21B6] rounded-xl transition-all shadow-md"
              >
                Dismiss Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCardCatalogView;
