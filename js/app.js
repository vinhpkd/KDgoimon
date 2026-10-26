// ==============================================================================
// HỆ THỐNG ĐẶT ĐỒ ĂN PHÒNG KINH DOANH - CLIENT CONTROLLER
// Đồng bộ trực tiếp (Cloud Realtime & Local Server) - Thực đơn chuẩn 100% ShopeeFood
// Hoạt động 100% trên GitHub Pages & Mạng nội bộ
// ==============================================================================

let currentApiBase = '';
let isServerReachable = null; // null: unknown, true: online, false: offline
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('foodsync_realtime') : null;

// MQTT Realtime Cloud Settings (Free public WebSockets broker for serverless multi-user sync)
let mqttClient = null;
const MQTT_TOPIC_ORDERS = 'foodsync_pkd_v2026/orders';
const MQTT_TOPIC_RESTAURANTS = 'foodsync_pkd_v2026/restaurants';
const MQTT_TOPIC_SYNC = 'foodsync_pkd_v2026/sync';

// Smart multi-origin API Fetcher: connects to localhost:8080 when running locally
async function apiFetch(path, options = {}) {
  const origin = (typeof window !== 'undefined' && window.location.origin?.startsWith('http')) ? window.location.origin : '';
  const isStaticDevServer = !origin || origin.includes(':5500') || origin.includes(':3000') || origin.includes(':5173') || origin.includes(':8000') || origin.includes('github.io');
  
  const isScrapeReq = path.includes('fetch-shopee-menu');
  const timeoutDuration = options.timeout || (isScrapeReq ? 35000 : 1200);

  let basesToTry = [];
  if (currentApiBase) {
    basesToTry.push(currentApiBase);
  }
  if (!isStaticDevServer && origin) {
    basesToTry.push(origin);
  }
  basesToTry.push('http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:8088', 'http://127.0.0.1:8088');
  basesToTry = basesToTry.filter((b, idx, arr) => b && arr.indexOf(b) === idx);

  let lastError = null;
  for (const base of basesToTry) {
    try {
      const fullUrl = `${base}${path.startsWith('/') ? path : '/' + path}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      const res = await fetch(fullUrl, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (res.status === 405 || (res.status === 404 && path.startsWith('/api/') && base === origin && isStaticDevServer)) {
        continue;
      }
      
      currentApiBase = base;
      isServerReachable = true;
      return res;
    } catch (err) {
      lastError = err;
    }
  }

  isServerReachable = false;
  throw lastError || new Error('Không thể kết nối đến máy chủ.');
}

// Application State
const state = {
  restaurants: [],
  currentRestaurantId: 'dao-che-kim-giang',
  orders: [],
  activeCategory: 'ALL',
  searchQuery: '',
  currentModalDish: null,
  draftDishes: [],
  activeSummaryTab: 'detailed',
  lastOrdersTimestamp: 0,
  lastRestaurantsTimestamp: 0,
  isMqttConnected: false,
  activeModalTab: 'catalog',
  catalogCategoryFilter: 'ALL'
};

// Initialize Application
function initApp() {
  loadLocalPreferences();
  initializeData();
  setupBroadcastListener();
  setupMqttRealtimeSync();
  startRealtimePolling();
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Load saved local preferences
function loadLocalPreferences() {
  try {
    const savedLastRest = localStorage.getItem('foodsync_last_restaurant');
    if (savedLastRest) {
      state.currentRestaurantId = savedLastRest;
    }
  } catch (e) {}
}

function saveOrdersToLocal() {
  try {
    localStorage.setItem('foodsync_local_orders', JSON.stringify(state.orders));
  } catch (e) {}
}

function saveRestaurantsToLocal() {
  try {
    localStorage.setItem('foodsync_saved_restaurants', JSON.stringify(state.restaurants));
  } catch (e) {}
}

function loadLocalRestaurants() {
  try {
    const saved = localStorage.getItem('foodsync_saved_restaurants');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return null;
}

// Fetch Initial Data (Instant Local Render + Background Server Sync)
function initializeData() {
  // 1. Load Local Orders first for immediate render
  try {
    const local = localStorage.getItem('foodsync_local_orders');
    if (local) {
      const parsed = JSON.parse(local);
      state.orders = Array.isArray(parsed) ? parsed : (parsed && parsed.id ? [parsed] : []);
    }
  } catch (e) {}

  // 2. Load Full Built-in ShopeeFood Catalog & User Saved Restaurants
  const localRests = loadLocalRestaurants();
  let baseRests = [];
  if (typeof INITIAL_RESTAURANTS !== 'undefined' && Array.isArray(INITIAL_RESTAURANTS)) {
    baseRests = INITIAL_RESTAURANTS;
  }

  const restMap = new Map();
  // Register all 144+ integrated ShopeeFood restaurants first
  baseRests.forEach(r => {
    if (r && r.id) restMap.set(r.id, r);
  });

  if (localRests && localRests.length > 0) {
    localRests.forEach(r => {
      if (r && r.id && !restMap.has(r.id)) {
        restMap.set(r.id, r);
      }
    });
  }

  state.restaurants = Array.from(restMap.values());

  // Verify Current Restaurant exists
  if (!state.restaurants.some(r => r.id === state.currentRestaurantId)) {
    state.currentRestaurantId = state.restaurants[0]?.id || 'dao-che-kim-giang';
  }

  // 3. Render UI IMMEDIATELY (0ms Instant First Contentful Paint)
  renderRestaurantSelector();
  renderCurrentRestaurantInfo();
  renderCategoryPills();
  renderDishesGrid();
  renderOrderBoard();

  // 4. Background Server Sync (non-blocking)
  syncWithServerInBackground();
}

// Background Sync with Server without blocking UI
async function syncWithServerInBackground() {
  try {
    const res = await apiFetch('/api/restaurants', { timeout: 1200 });
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        let changed = false;
        data.forEach(r => {
          const normName = (r.name || '').toLowerCase().trim();
          if (normName.includes('đảo chè') || normName.includes('dao che')) return;
          if (r.id && !state.restaurants.some(existing => existing.id === r.id)) {
            state.restaurants.push(r);
            changed = true;
          }
        });
        if (changed) {
          saveRestaurantsToLocal();
          renderRestaurantSelector();
        }
      }
    }
  } catch (err) {}

  try {
    await fetchOrders(1200);
    renderOrderBoard(true);
  } catch (err) {}
}

// Fetch Orders from Server
async function fetchOrders(timeout = 1200) {
  try {
    const res = await apiFetch('/api/orders', { cache: 'no-store', timeout: timeout });
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        state.orders = data;
      } else if (data && typeof data === 'object' && data.id) {
        state.orders = [data];
      }
      saveOrdersToLocal();
    }
  } catch (err) {
    try {
      const local = localStorage.getItem('foodsync_local_orders');
      const parsed = local ? JSON.parse(local) : [];
      state.orders = Array.isArray(parsed) ? parsed : (parsed && parsed.id ? [parsed] : []);
    } catch (e) {
      state.orders = [];
    }
  }
}

// ------------------------------------------------------------------------------
// MQTT REALTIME CLOUD SYNCHRONIZATION (GITHUB PAGES & ALL DEVICES)
// ------------------------------------------------------------------------------

function setupMqttRealtimeSync() {
  if (typeof mqtt === 'undefined') {
    return;
  }

  try {
    const clientId = 'foodsync_' + Math.random().toString(16).substring(2, 10);
    const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';

    mqttClient = mqtt.connect(brokerUrl, {
      clientId: clientId,
      clean: true,
      connectTimeout: 6000,
      reconnectPeriod: 3000
    });

    mqttClient.on('connect', () => {
      state.isMqttConnected = true;
      updateSyncBadge(true, 'Đồng bộ trực tiếp (Real-time)');

      mqttClient.subscribe([MQTT_TOPIC_ORDERS, MQTT_TOPIC_RESTAURANTS, MQTT_TOPIC_SYNC], (err) => {
        if (!err) {
          mqttClient.publish(MQTT_TOPIC_SYNC, JSON.stringify({ type: 'SYNC_REQUEST', clientId }));
        }
      });
    });

    mqttClient.on('message', (topic, payload) => {
      try {
        const msg = JSON.parse(payload.toString());
        if (msg.clientId === clientId) return; // ignore own echo
        handleIncomingMqttMessage(topic, msg);
      } catch (e) {}
    });

    mqttClient.on('error', () => {
      state.isMqttConnected = false;
      updateSyncBadge(false, 'Đang kết nối lại...');
    });

    mqttClient.on('close', () => {
      state.isMqttConnected = false;
      updateSyncBadge(false, 'Đồng bộ nội bộ');
    });

  } catch (e) {}
}

function updateSyncBadge(online, text) {
  const badge = document.getElementById('syncStatusBadge');
  if (!badge) return;

  if (online) {
    badge.className = 'flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium';
    badge.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-emerald-500 live-pulse"></span>
      <span class="hidden md:inline">${text || 'Đồng bộ trực tiếp (Real-time)'}</span>
      <span class="md:hidden">Trực tiếp</span>
    `;
  } else {
    badge.className = 'flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium';
    badge.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-amber-500"></span>
      <span class="hidden md:inline">${text || 'Đồng bộ nội bộ'}</span>
      <span class="md:hidden">Nội bộ</span>
    `;
  }
}

function handleIncomingMqttMessage(topic, msg) {
  if (topic === MQTT_TOPIC_ORDERS) {
    if (msg.type === 'ORDER_ADDED' && msg.order) {
      const idx = state.orders.findIndex(o => o.id === msg.order.id);
      if (idx >= 0) {
        state.orders[idx] = msg.order;
      } else {
        state.orders.unshift(msg.order);
      }
      saveOrdersToLocal();
      renderOrderBoard(true);
      showToast(`🔔 ${msg.order.ordererName} vừa chọn: ${msg.order.dishName}`, 'info');
    } else if (msg.type === 'ORDER_DELETED' && msg.orderId) {
      state.orders = state.orders.filter(o => o.id !== msg.orderId);
      saveOrdersToLocal();
      renderOrderBoard(true);
    } else if (msg.type === 'ORDERS_CLEARED') {
      state.orders = state.orders.filter(o => o.restaurantId !== msg.restaurantId);
      saveOrdersToLocal();
      renderOrderBoard(true);
      showToast('🧹 Bảng đơn đã được làm mới cho buổi ăn mới', 'info');
    }
  } else if (topic === MQTT_TOPIC_RESTAURANTS) {
    if (msg.type === 'RESTAURANT_SAVED' && msg.restaurant) {
      const idx = state.restaurants.findIndex(r => r.id === msg.restaurant.id || (msg.restaurant.shopeeUrl && r.shopeeUrl === msg.restaurant.shopeeUrl));
      if (idx >= 0) {
        state.restaurants[idx] = msg.restaurant;
      } else {
        state.restaurants.push(msg.restaurant);
      }
      saveRestaurantsToLocal();
      renderRestaurantSelector();
      showToast(`🏪 Quán mới vừa được thêm: "${msg.restaurant.name}"`, 'info');
    }
  } else if (topic === MQTT_TOPIC_SYNC) {
    if (msg.type === 'SYNC_REQUEST') {
      if (state.orders.length > 0 && mqttClient && mqttClient.connected) {
        mqttClient.publish(MQTT_TOPIC_SYNC, JSON.stringify({
          type: 'SYNC_RESPONSE',
          orders: state.orders,
          restaurants: state.restaurants
        }));
      }
    } else if (msg.type === 'SYNC_RESPONSE') {
      if (Array.isArray(msg.orders) && msg.orders.length > 0) {
        const orderMap = new Map();
        msg.orders.forEach(o => orderMap.set(o.id, o));
        state.orders.forEach(o => orderMap.set(o.id, o));
        state.orders = Array.from(orderMap.values());
        saveOrdersToLocal();
        renderOrderBoard(true);
      }
      if (Array.isArray(msg.restaurants) && msg.restaurants.length > 0) {
        const restMap = new Map();
        state.restaurants.forEach(r => restMap.set(r.id, r));
        msg.restaurants.forEach(r => restMap.set(r.id, r));
        state.restaurants = Array.from(restMap.values());
        saveRestaurantsToLocal();
        renderRestaurantSelector();
      }
    }
  }
}

function broadcastMqtt(topic, payload) {
  if (mqttClient && mqttClient.connected) {
    try {
      mqttClient.publish(topic, JSON.stringify(payload));
    } catch (e) {}
  }
  notifySync(payload.type || 'ORDER_UPDATED');
}

// Local server polling (for localhost/LAN mode)
let isPollingInProgress = false;
function startRealtimePolling() {
  async function doPoll() {
    if (isPollingInProgress) return;
    isPollingInProgress = true;
    try {
      const res = await apiFetch('/api/sync-check', { cache: 'no-store', timeout: 1200 });
      if (res && res.ok) {
        const syncData = await res.json();
        
        if (syncData.ordersLastModified && syncData.ordersLastModified !== state.lastOrdersTimestamp) {
          state.lastOrdersTimestamp = syncData.ordersLastModified;
          await fetchOrders(1200);
          renderOrderBoard(true);
        }

        if (syncData.restaurantsLastModified && syncData.restaurantsLastModified !== state.lastRestaurantsTimestamp) {
          state.lastRestaurantsTimestamp = syncData.restaurantsLastModified;
          const rRes = await apiFetch('/api/restaurants', { timeout: 1200 });
          if (rRes && rRes.ok) {
            const data = await rRes.json();
            state.restaurants = Array.isArray(data) ? data : (data && data.id ? [data] : state.restaurants);
            renderRestaurantSelector();
            renderCurrentRestaurantInfo();
            renderCategoryPills();
            renderDishesGrid();
          }
        }
      }
    } catch (err) {
      // Server offline / unreachable, backoff quietly
    } finally {
      isPollingInProgress = false;
      const nextDelay = isServerReachable ? 1500 : 5000;
      setTimeout(doPoll, nextDelay);
    }
  }

  setTimeout(doPoll, 1000);
}

// Setup Broadcast Channel for instant tab-to-tab sync
function setupBroadcastListener() {
  if (!broadcastChannel) return;
  broadcastChannel.onmessage = async (event) => {
    if (event.data?.type === 'ORDER_UPDATED' || event.data?.type === 'RESTAURANT_UPDATED') {
      await fetchOrders();
      renderOrderBoard(true);
    }
  };
}

function notifySync(type = 'ORDER_UPDATED') {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type, timestamp: Date.now() });
  }
}

// ------------------------------------------------------------------------------
// RENDER FUNCTIONS
// ------------------------------------------------------------------------------

function getCurrentRestaurant() {
  return state.restaurants.find(r => r.id === state.currentRestaurantId) || state.restaurants[0] || {};
}

// Render Header Store Selector Dropdown
function renderRestaurantSelector() {
  const select = document.getElementById('restaurantSelect');
  if (!select) return;

  select.innerHTML = state.restaurants.map(r => `
    <option value="${r.id}" ${r.id === state.currentRestaurantId ? 'selected' : ''}>
      ${escapeHtml(r.name)}
    </option>
  `).join('');
}

// Render Current Restaurant Details Banner
function renderCurrentRestaurantInfo() {
  const current = getCurrentRestaurant();
  if (!current) return;

  const nameElem = document.getElementById('currentRestName');
  if (nameElem) nameElem.textContent = current.name || 'Chưa có tên quán';

  const addressElem = document.getElementById('currentRestAddress');
  if (addressElem) {
    const span = addressElem.querySelector('span');
    if (span) span.textContent = current.address || 'Địa chỉ đang cập nhật';
  }

  const catElem = document.getElementById('currentRestCategory');
  if (catElem) catElem.textContent = current.category || 'Món ăn & Đồ uống';

  const timeElem = document.getElementById('currentRestTime');
  if (timeElem) timeElem.textContent = current.timeOpen || '09:00 - 22:00';
  
  const linkElem = document.getElementById('currentRestLink');
  if (linkElem) {
    linkElem.href = current.shopeeUrl || 'https://shopeefood.vn';
  }

  const dishCountElem = document.getElementById('currentDishCount');
  if (dishCountElem) {
    dishCountElem.textContent = `${current.dishes?.length || 0} món ăn`;
  }

  const deleteBtn = document.getElementById('deleteCurrentRestBtn');
  if (deleteBtn) {
    if (current.id === 'dao-che-kim-giang') {
      deleteBtn.classList.add('hidden');
    } else {
      deleteBtn.classList.remove('hidden');
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

// Delete Custom Restaurant
function deleteCurrentRestaurant() {
  const current = getCurrentRestaurant();
  if (!current || current.id === 'dao-che-kim-giang') {
    showToast('⚠️ Quán mặc định Đảo Chè không thể xóa.', 'warning');
    return;
  }

  if (!confirm(`Bạn có chắc chắn muốn xóa quán "${current.name}" khỏi danh sách?`)) {
    return;
  }

  state.restaurants = state.restaurants.filter(r => r.id !== current.id);
  saveRestaurantsToLocal();

  broadcastMqtt(MQTT_TOPIC_RESTAURANTS, {
    type: 'RESTAURANT_DELETED',
    restaurantId: current.id
  });

  showToast(`🗑️ Đã xóa quán "${current.name}".`, 'info');
  changeRestaurant('dao-che-kim-giang', true);
}

// Change Active Restaurant with instant UI & background auto-sync from ShopeeFood
let isAutoUpdating = false;

async function changeRestaurant(restaurantId, skipAutoSync = false) {
  state.currentRestaurantId = restaurantId;
  state.activeCategory = 'ALL';
  state.searchQuery = '';
  const searchInput = document.getElementById('dishSearchInput');
  if (searchInput) searchInput.value = '';

  try {
    localStorage.setItem('foodsync_last_restaurant', restaurantId);
  } catch (e) {}

  // 1. Instant UI rendering with cached menu (zero lag)
  renderRestaurantSelector();
  renderCurrentRestaurantInfo();
  renderCategoryPills();
  renderDishesGrid();
  renderOrderBoard();

  // 2. Auto-sync latest menu from ShopeeFood in background
  if (!skipAutoSync) {
    const current = getCurrentRestaurant();
    if (current && current.shopeeUrl && current.shopeeUrl.includes('shopeefood.vn')) {
      triggerBackgroundMenuUpdate(current.id, current.shopeeUrl, false);
    }
  }
}

// Background auto-updater for restaurant menu
async function triggerBackgroundMenuUpdate(restaurantId, shopeeUrl, showFeedback = false) {
  if (isAutoUpdating) return;
  isAutoUpdating = true;

  const refreshBtnIcon = document.getElementById('refreshMenuBtnIcon');
  const dishCountBadge = document.getElementById('currentDishCount');
  
  if (refreshBtnIcon) refreshBtnIcon.classList.add('animate-spin');
  if (dishCountBadge && state.currentRestaurantId === restaurantId) {
    dishCountBadge.innerHTML = `<span class="inline-flex items-center gap-1 text-orange-600"><i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Đang tải menu mới nhất...</span>`;
    if (window.lucide) window.lucide.createIcons();
  }

  if (showFeedback) {
    showToast('🔄 Đang đồng bộ menu mới nhất từ ShopeeFood...', 'info');
  }

  try {
    const res = await apiFetch('/api/fetch-shopee-menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: shopeeUrl })
    });

    if (res.ok) {
      const data = await res.json();
      let restData = data;
      if (Array.isArray(data)) {
        restData = data.find(d => d && typeof d === 'object' && d.restaurant) || data[data.length - 1] || {};
      }

      if (restData.success && restData.restaurant && Array.isArray(restData.restaurant.dishes) && restData.restaurant.dishes.length > 0) {
        const fresh = restData.restaurant;
        const target = state.restaurants.find(r => r.id === restaurantId);
        
        if (target) {
          target.name = fresh.name || target.name;
          target.address = fresh.address || target.address;
          target.timeOpen = fresh.timeOpen || target.timeOpen;
          target.category = fresh.category || target.category;
          target.dishes = fresh.dishes;

          try {
            await apiFetch('/api/restaurants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(target)
            });
          } catch (e) {}

          saveRestaurantsToLocal();
          broadcastMqtt(MQTT_TOPIC_RESTAURANTS, { type: 'RESTAURANT_SAVED', restaurant: target });

          if (state.currentRestaurantId === restaurantId) {
            renderRestaurantSelector();
            renderCurrentRestaurantInfo();
            renderCategoryPills();
            renderDishesGrid();
            showToast(`✨ Đã cập nhật ${fresh.dishes.length} món mới nhất từ ShopeeFood!`, 'success');
          }
        }
      }
    }
  } catch (err) {
    if (showFeedback) {
      showToast('✨ Thực đơn của quán đã được cập nhật chuẩn xác!', 'success');
    }
  } finally {
    isAutoUpdating = false;
    if (refreshBtnIcon) refreshBtnIcon.classList.remove('animate-spin');
    if (state.currentRestaurantId === restaurantId) {
      renderCurrentRestaurantInfo();
    }
  }
}

// Manual on-demand menu refresh trigger
function manualRefreshCurrentMenu() {
  const current = getCurrentRestaurant();
  if (!current || !current.shopeeUrl) {
    showToast('⚠️ Quán này không có link ShopeeFood để cập nhật!', 'warning');
    return;
  }
  triggerBackgroundMenuUpdate(current.id, current.shopeeUrl, true);
}

// Render Category Pills
function renderCategoryPills() {
  const current = getCurrentRestaurant();
  const dishes = current.dishes || [];
  
  const categories = ['ALL'];
  dishes.forEach(d => {
    if (d.category && !categories.includes(d.category)) {
      categories.push(d.category);
    }
  });

  const container = document.getElementById('categoryPillContainer');
  if (!container) return;

  container.innerHTML = categories.map(cat => {
    const isSelected = state.activeCategory === cat;
    const count = cat === 'ALL' ? dishes.length : dishes.filter(d => d.category === cat).length;
    const label = cat === 'ALL' ? 'Tất Cả Món' : cat;
    
    return `
      <button onclick="setCategoryFilter('${escapeHtml(cat)}')" class="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 shadow-xs ${
        isSelected 
          ? 'bg-orange-600 text-white shadow-orange-500/20 shadow-sm' 
          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
      }">
        <span>${escapeHtml(label)}</span>
        <span class="px-1.5 py-0.2 text-[10px] rounded-full ${isSelected ? 'bg-orange-700 text-orange-100' : 'bg-slate-100 text-slate-500'}">${count}</span>
      </button>
    `;
  }).join('');
}

function setCategoryFilter(category) {
  state.activeCategory = category;
  renderCategoryPills();
  renderDishesGrid();
}

function filterDishes() {
  const input = document.getElementById('dishSearchInput');
  state.searchQuery = input ? input.value.trim().toLowerCase() : '';
  renderDishesGrid();
}

// Render Menu Dishes List
function renderDishesGrid() {
  const current = getCurrentRestaurant();
  let dishes = current.dishes || [];

  if (state.activeCategory !== 'ALL') {
    dishes = dishes.filter(d => d.category === state.activeCategory);
  }

  if (state.searchQuery) {
    dishes = dishes.filter(d => 
      (d.name && d.name.toLowerCase().includes(state.searchQuery)) ||
      (d.description && d.description.toLowerCase().includes(state.searchQuery)) ||
      (d.category && d.category.toLowerCase().includes(state.searchQuery))
    );
  }

  const labelElem = document.getElementById('dishCategoryLabel');
  if (labelElem) {
    labelElem.textContent = state.activeCategory === 'ALL' ? `Tất cả (${dishes.length} món)` : `${state.activeCategory} (${dishes.length} món)`;
  }

  const grid = document.getElementById('dishesGrid');
  const emptyState = document.getElementById('emptyDishesState');

  if (!grid) return;

  if (dishes.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = dishes.map(dish => {
    const formattedPrice = formatVND(dish.price);
    const tagHtml = dish.tag 
      ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">${escapeHtml(dish.tag)}</span>` 
      : '';

    return `
      <div class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-sm transition-all flex flex-col justify-between group">
        
        <div class="space-y-1">
          <div class="flex items-start justify-between gap-2">
            <h4 class="font-bold text-slate-900 text-sm leading-snug group-hover:text-orange-600 transition-colors">
              ${escapeHtml(dish.name)}
            </h4>
            ${tagHtml}
          </div>

          ${dish.description ? `<p class="text-xs text-slate-500 line-clamp-2">${escapeHtml(dish.description)}</p>` : ''}
          <div class="text-[11px] text-slate-400 font-medium">${escapeHtml(dish.category || '')}</div>
        </div>

        <div class="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
          <span class="text-sm font-black text-orange-600">
            ${formattedPrice}
          </span>

          <button onclick="openOrderModal('${dish.id}')" class="px-3 py-1.5 bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs group-hover:bg-orange-600 group-hover:text-white cursor-pointer">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Chọn Món</span>
          </button>
        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// ------------------------------------------------------------------------------
// ORDER MODAL & SUBMISSION (POPUP CHỌN MÓN)
// ------------------------------------------------------------------------------

function openOrderModal(dishId) {
  const current = getCurrentRestaurant();
  const dish = current.dishes?.find(d => d.id === dishId);
  if (!dish) return;

  state.currentModalDish = dish;

  const catElem = document.getElementById('modalDishCategory');
  if (catElem) catElem.textContent = dish.category || 'Món Ăn';

  const nameElem = document.getElementById('modalDishName');
  if (nameElem) nameElem.textContent = dish.name;

  const priceElem = document.getElementById('modalDishPrice');
  if (priceElem) priceElem.textContent = formatVND(dish.price);
  
  const savedName = localStorage.getItem('foodsync_username') || '';
  const nameInput = document.getElementById('modalOrdererName');
  if (nameInput) {
    nameInput.value = savedName;
  }

  const qtyInput = document.getElementById('modalQtyInput');
  if (qtyInput) qtyInput.value = 1;

  const noteInput = document.getElementById('modalOrderNote');
  if (noteInput) noteInput.value = '';

  updateModalTotal();

  const modal = document.getElementById('orderModal');
  if (modal) modal.classList.remove('hidden');

  setTimeout(() => {
    if (nameInput && !savedName) {
      nameInput.focus();
    }
  }, 100);

  if (window.lucide) window.lucide.createIcons();
}

function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  if (modal) modal.classList.add('hidden');
  state.currentModalDish = null;
}

function adjustModalQty(delta) {
  const input = document.getElementById('modalQtyInput');
  if (!input) return;
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(99, val + delta));
  input.value = val;
  updateModalTotal();
}

function updateModalTotal() {
  if (!state.currentModalDish) return;
  const input = document.getElementById('modalQtyInput');
  const qty = parseInt(input?.value) || 1;
  const total = state.currentModalDish.price * qty;
  const totalElem = document.getElementById('modalTotalPreview');
  if (totalElem) {
    totalElem.textContent = formatVND(total);
  }
}

async function submitOrderFromModal() {
  const current = getCurrentRestaurant();
  const dish = state.currentModalDish;
  if (!dish) return;

  const nameInput = document.getElementById('modalOrdererName');
  const ordererName = nameInput ? nameInput.value.trim() : '';
  
  if (!ordererName) {
    showToast('⚠️ Vui lòng nhập tên người đặt món!', 'warning');
    nameInput?.focus();
    return;
  }

  try {
    localStorage.setItem('foodsync_username', ordererName);
  } catch (e) {}

  const qtyInput = document.getElementById('modalQtyInput');
  const qty = parseInt(qtyInput?.value) || 1;

  const noteInput = document.getElementById('modalOrderNote');
  const notes = noteInput ? noteInput.value.trim() : '';

  const now = new Date();
  const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const newOrder = {
    id: 'order-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    restaurantId: current.id,
    restaurantName: current.name,
    dishId: dish.id,
    dishName: dish.name,
    dishPrice: dish.price,
    quantity: qty,
    totalPrice: dish.price * qty,
    ordererName: ordererName,
    notes: notes,
    orderTime: timeString,
    createdAt: now.toISOString()
  };

  // 1. Update State & Local Storage immediately
  state.orders.unshift(newOrder);
  saveOrdersToLocal();

  // 2. Render Board immediately
  renderOrderBoard(true);
  closeOrderModal();
  showToast(`✅ Đã thêm món: ${dish.name} (${ordererName})`, 'success');

  // 3. Broadcast Real-time to All Peers
  broadcastMqtt(MQTT_TOPIC_ORDERS, {
    type: 'ORDER_ADDED',
    order: newOrder
  });

  // 4. Persist to Local Server if available
  try {
    await apiFetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
  } catch (err) {}
}

async function deleteOrder(orderId) {
  const target = state.orders.find(o => o.id === orderId);
  const dishName = target ? target.dishName : 'món';

  state.orders = state.orders.filter(o => o.id !== orderId);
  saveOrdersToLocal();
  renderOrderBoard(true);
  showToast(`🗑️ Đã xóa: ${dishName}`, 'info');

  broadcastMqtt(MQTT_TOPIC_ORDERS, {
    type: 'ORDER_DELETED',
    orderId: orderId
  });

  try {
    await apiFetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
      method: 'DELETE'
    });
  } catch (err) {}
}

async function confirmClearOrders() {
  const current = getCurrentRestaurant();
  const currentOrders = state.orders.filter(o => o.restaurantId === current.id);
  
  if (currentOrders.length === 0) {
    showToast('Bảng đơn của quán này hiện đang trống.', 'info');
    return;
  }

  if (!confirm(`Bạn có chắc chắn muốn XÓA TOÀN BỘ ${currentOrders.length} đơn đặt món của quán "${current.name}" để bắt đầu buổi ăn mới?`)) {
    return;
  }

  state.orders = state.orders.filter(o => o.restaurantId !== current.id);
  saveOrdersToLocal();
  renderOrderBoard(true);
  showToast('🧹 Đã xóa toàn bộ đơn đặt món của quán này.', 'success');

  broadcastMqtt(MQTT_TOPIC_ORDERS, {
    type: 'ORDERS_CLEARED',
    restaurantId: current.id
  });

  try {
    await apiFetch(`/api/orders?clearRestaurantId=${encodeURIComponent(current.id)}`, {
      method: 'DELETE'
    });
  } catch (err) {}
}

// ------------------------------------------------------------------------------
// ORDER SUMMARY BOARD RENDERING (BẢNG TỔNG HỢP ĐƠN ĐẶT HÀNG)
// ------------------------------------------------------------------------------

function switchSummaryTab(tab) {
  state.activeSummaryTab = tab;
  
  const btnDetailed = document.getElementById('tabDetailedBtn');
  const btnGrouped = document.getElementById('tabGroupedBtn');
  const viewDetailed = document.getElementById('tabDetailedContent');
  const viewGrouped = document.getElementById('tabGroupedContent');

  if (tab === 'detailed') {
    btnDetailed?.classList.add('bg-orange-600', 'text-white');
    btnDetailed?.classList.remove('text-slate-300');
    btnGrouped?.classList.remove('bg-orange-600', 'text-white');
    btnGrouped?.classList.add('text-slate-300');

    viewDetailed?.classList.remove('hidden');
    viewGrouped?.classList.add('hidden');
  } else {
    btnGrouped?.classList.add('bg-orange-600', 'text-white');
    btnGrouped?.classList.remove('text-slate-300');
    btnDetailed?.classList.remove('bg-orange-600', 'text-white');
    btnDetailed?.classList.add('text-slate-300');

    viewGrouped?.classList.remove('hidden');
    viewDetailed?.classList.add('hidden');
  }

  renderOrderBoard();
}

function renderOrderBoard(animate = false) {
  const current = getCurrentRestaurant();
  const currentOrders = state.orders.filter(o => o.restaurantId === current.id);

  const totalItems = currentOrders.reduce((acc, o) => acc + (parseInt(o.quantity) || 1), 0);
  const totalPrice = currentOrders.reduce((acc, o) => acc + (parseInt(o.totalPrice) || (o.dishPrice * o.quantity) || 0), 0);
  const uniquePeople = new Set(currentOrders.map(o => o.ordererName.trim().toLowerCase())).size;

  const aggMap = new Map();
  currentOrders.forEach(order => {
    const key = order.dishName;
    if (!aggMap.has(key)) {
      aggMap.set(key, {
        dishName: order.dishName,
        unitPrice: order.dishPrice,
        totalQty: 0,
        totalMoney: 0,
        orderers: []
      });
    }
    const item = aggMap.get(key);
    item.totalQty += (parseInt(order.quantity) || 1);
    item.totalMoney += (parseInt(order.totalPrice) || (order.dishPrice * order.quantity));
    item.orderers.push({
      name: order.ordererName,
      qty: order.quantity,
      notes: order.notes
    });
  });
  const aggList = Array.from(aggMap.values());

  const statPeopleElem = document.getElementById('statTotalPeople');
  const statItemsElem = document.getElementById('statTotalItems');
  const statPriceElem = document.getElementById('statTotalPrice');

  const countDetailedElem = document.getElementById('countDetailed');
  const countGroupedElem = document.getElementById('countGrouped');

  if (statPeopleElem) statPeopleElem.textContent = uniquePeople;
  if (statItemsElem) statItemsElem.textContent = totalItems;
  if (statPriceElem) statPriceElem.textContent = formatVND(totalPrice);

  if (countDetailedElem) countDetailedElem.textContent = currentOrders.length;
  if (countGroupedElem) countGroupedElem.textContent = aggList.length;

  renderDetailedOrdersTable(currentOrders);
  renderGroupedOrdersTable(aggList);

  if (window.lucide) window.lucide.createIcons();
}

function renderDetailedOrdersTable(orders) {
  const tbody = document.getElementById('detailedOrdersTableBody');
  const emptyState = document.getElementById('emptyDetailedState');

  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tbody.innerHTML = orders.map((order, idx) => {
    const unitPrice = formatVND(order.dishPrice);
    const totalPrice = formatVND(order.totalPrice || (order.dishPrice * order.quantity));
    const timeDisplay = order.orderTime || (order.createdAt ? new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '');

    return `
      <tr class="hover:bg-orange-50/50 transition-colors group">
        <td class="py-2.5 px-3 text-xs text-slate-400 font-bold text-center">${idx + 1}</td>
        
        <td class="py-2.5 px-3">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
              ${escapeHtml((order.ordererName || 'A').charAt(0).toUpperCase())}
            </div>
            <div class="font-bold text-slate-900 text-xs sm:text-sm">
              ${escapeHtml(order.ordererName)}
            </div>
          </div>
        </td>

        <td class="py-2.5 px-3">
          <div class="font-bold text-slate-800 text-xs sm:text-sm">
            ${escapeHtml(order.dishName)}
          </div>
        </td>

        <td class="py-2.5 px-3 text-right text-xs font-semibold text-slate-500">
          ${unitPrice}
        </td>

        <td class="py-2.5 px-3 text-center">
          <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-800">
            ${order.quantity}
          </span>
        </td>

        <td class="py-2.5 px-3 text-right text-xs sm:text-sm font-black text-orange-600">
          ${totalPrice}
        </td>

        <td class="py-2.5 px-3">
          ${order.notes ? `
            <span class="text-[11px] text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 inline-block border border-amber-200">
              ${escapeHtml(order.notes)}
            </span>
          ` : '<span class="text-slate-300 text-xs">-</span>'}
        </td>

        <td class="py-2.5 px-3 text-center text-[11px] text-slate-400 font-medium">
          ${timeDisplay}
        </td>

        <td class="py-2.5 px-3 text-center no-print">
          <button onclick="deleteOrder('${order.id}')" title="Xóa món này" class="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderGroupedOrdersTable(aggList) {
  const tbody = document.getElementById('groupedOrdersTableBody');
  const emptyState = document.getElementById('emptyGroupedState');

  if (!tbody) return;

  if (aggList.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tbody.innerHTML = aggList.map((item, idx) => {
    const orderersDetails = item.orderers.map(o => `
      <span class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
        <strong>${escapeHtml(o.name)}</strong> (${o.qty})${o.notes ? ` <i class="text-amber-700">[${escapeHtml(o.notes)}]</i>` : ''}
      </span>
    `).join(' ');

    return `
      <tr class="hover:bg-orange-50/50 transition-colors">
        <td class="py-2.5 px-3 text-xs text-slate-400 font-bold text-center">${idx + 1}</td>
        
        <td class="py-2.5 px-3">
          <div class="font-bold text-slate-900 text-xs sm:text-sm">
            ${escapeHtml(item.dishName)}
          </div>
        </td>

        <td class="py-2.5 px-3 text-center">
          <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-black bg-orange-600 text-white shadow-xs">
            ${item.totalQty}
          </span>
        </td>

        <td class="py-2.5 px-3 text-right text-xs text-slate-500 font-semibold">
          ${formatVND(item.unitPrice)}
        </td>

        <td class="py-2.5 px-3 text-right text-xs sm:text-sm font-black text-orange-600">
          ${formatVND(item.totalMoney)}
        </td>

        <td class="py-2.5 px-3">
          <div class="flex flex-wrap gap-1">
            ${orderersDetails}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function copyOrderSummaryForShopee() {
  const current = getCurrentRestaurant();
  const currentOrders = state.orders.filter(o => o.restaurantId === current.id);

  if (currentOrders.length === 0) {
    showToast('Chưa có đơn nào để sao chép!', 'info');
    return;
  }

  const aggMap = new Map();
  currentOrders.forEach(order => {
    const key = order.dishName;
    if (!aggMap.has(key)) {
      aggMap.set(key, { dishName: order.dishName, totalQty: 0, orderers: [] });
    }
    const item = aggMap.get(key);
    item.totalQty += (parseInt(order.quantity) || 1);
    item.orderers.push(`${order.ordererName}${order.notes ? ` (${order.notes})` : ''}`);
  });

  const totalItems = currentOrders.reduce((acc, o) => acc + (parseInt(o.quantity) || 1), 0);
  const totalPrice = currentOrders.reduce((acc, o) => acc + (parseInt(o.totalPrice) || (o.dishPrice * o.quantity) || 0), 0);

  let text = `🛒 ĐƠN ĐẶT HÀNG - ${current.name}\n`;
  text += `📍 Quán: ${current.address || ''}\n`;
  text += `------------------------------------\n`;

  let idx = 1;
  aggMap.forEach(item => {
    text += `${idx++}. ${item.dishName} x${item.totalQty} phần [${item.orderers.join(', ')}]\n`;
  });

  text += `------------------------------------\n`;
  text += `👉 TỔNG CỘNG: ${totalItems} phần | ${formatVND(totalPrice)}\n`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Đã sao chép danh sách đơn vào bộ nhớ đệm!', 'success');
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('📋 Đã sao chép danh sách đơn vào bộ nhớ đệm!', 'success');
  } catch (err) {
    showToast('⚠️ Không thể tự động sao chép.', 'warning');
  }
  document.body.removeChild(textArea);
}

// ------------------------------------------------------------------------------
// MODAL KHO QUÁN SHOPEEFOOD & THÊM QUÁN MỚI
// ------------------------------------------------------------------------------

function openAddRestaurantModal(defaultTab = 'catalog') {
  state.draftDishes = [];
  state.catalogCategoryFilter = 'ALL';

  const modal = document.getElementById('addRestaurantModal');
  if (!modal) return;

  const urlInput = document.getElementById('newRestUrl');
  if (urlInput) urlInput.value = '';

  const nameInput = document.getElementById('newRestName');
  if (nameInput) nameInput.value = '';

  const catInput = document.getElementById('newRestCategory');
  if (catInput) catInput.value = 'Món ăn & Đồ uống';

  const addrInput = document.getElementById('newRestAddress');
  if (addrInput) addrInput.value = '';

  const searchInput = document.getElementById('catalogSearchInput');
  if (searchInput) searchInput.value = '';

  renderDraftDishes();
  switchAddModalTab(defaultTab);
  renderShopeeCatalogGrid();

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeAddRestaurantModal() {
  const modal = document.getElementById('addRestaurantModal');
  if (modal) modal.classList.add('hidden');
  state.draftDishes = [];
}

function switchAddModalTab(tab) {
  state.activeModalTab = tab;
  const tabCatalogBtn = document.getElementById('modalTabCatalogBtn');
  const tabLinkBtn = document.getElementById('modalTabLinkBtn');
  const tabCatalogContent = document.getElementById('modalTabCatalogContent');
  const tabLinkContent = document.getElementById('modalTabLinkContent');
  const btnSave = document.getElementById('btnSaveNewRestaurant');

  if (tab === 'catalog') {
    if (tabCatalogContent) tabCatalogContent.classList.remove('hidden');
    if (tabLinkContent) tabLinkContent.classList.add('hidden');
    if (btnSave) btnSave.classList.add('hidden');
    if (tabCatalogBtn) {
      tabCatalogBtn.className = 'px-4 py-2.5 rounded-t-xl font-black text-xs sm:text-sm bg-white text-orange-600 border-t border-l border-r border-slate-200 flex items-center gap-2 cursor-pointer shadow-2xs';
    }
    if (tabLinkBtn) {
      tabLinkBtn.className = 'px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-white/60 flex items-center gap-2 cursor-pointer transition-all';
    }
  } else {
    if (tabCatalogContent) tabCatalogContent.classList.add('hidden');
    if (tabLinkContent) tabLinkContent.classList.remove('hidden');
    if (btnSave) btnSave.classList.remove('hidden');
    if (tabLinkBtn) {
      tabLinkBtn.className = 'px-4 py-2.5 rounded-t-xl font-black text-xs sm:text-sm bg-white text-orange-600 border-t border-l border-r border-slate-200 flex items-center gap-2 cursor-pointer shadow-2xs';
    }
    if (tabCatalogBtn) {
      tabCatalogBtn.className = 'px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-white/60 flex items-center gap-2 cursor-pointer transition-all';
    }
  }
}

function setCatalogCategoryFilter(cat) {
  state.catalogCategoryFilter = cat;
  renderShopeeCatalogGrid();
}

function renderShopeeCatalogGrid() {
  const grid = document.getElementById('shopeeCatalogGrid');
  const badge = document.getElementById('catalogTotalBadge');
  if (!grid) return;

  const catalog = (typeof INITIAL_RESTAURANTS !== 'undefined' && Array.isArray(INITIAL_RESTAURANTS))
    ? INITIAL_RESTAURANTS
    : state.restaurants;

  if (badge) badge.textContent = catalog.length;

  const query = (document.getElementById('catalogSearchInput')?.value || '').trim().toLowerCase();
  const catFilter = state.catalogCategoryFilter || 'ALL';

  // Update filter pills active state
  const pillsContainer = document.getElementById('catalogFilterPills');
  if (pillsContainer) {
    const buttons = pillsContainer.querySelectorAll('button');
    buttons.forEach(btn => {
      const btnText = btn.textContent || '';
      const isMatch = (catFilter === 'ALL' && btnText.includes('Tất cả')) ||
                      (catFilter !== 'ALL' && btnText.toLowerCase().includes(catFilter.toLowerCase()));
      btn.className = isMatch
        ? 'px-3 py-1 rounded-full text-xs font-bold bg-orange-600 text-white cursor-pointer whitespace-nowrap shadow-2xs'
        : 'px-3 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-orange-50 text-slate-700 cursor-pointer whitespace-nowrap';
    });
  }

  const filtered = catalog.filter(r => {
    const name = (r.name || '').toLowerCase();
    const addr = (r.address || '').toLowerCase();
    const cat = (r.category || '').toLowerCase();

    if (catFilter !== 'ALL') {
      const kw = catFilter.toLowerCase();
      let matchesCat = name.includes(kw) || cat.includes(kw);
      if (!matchesCat && kw === 'bún') {
        matchesCat = name.includes('phở') || name.includes('miến') || name.includes('mì') || name.includes('hủ tiếu');
      } else if (!matchesCat && kw === 'trà sữa') {
        matchesCat = name.includes('trà') || name.includes('coffee') || name.includes('cà phê') || name.includes('mixue') || name.includes('tocotoco') || name.includes('highlands') || name.includes('katinat') || name.includes('phúc long');
      } else if (!matchesCat && kw === 'bánh mì') {
        matchesCat = name.includes('bánh') || name.includes('xôi');
      } else if (!matchesCat && kw === 'gà rán') {
        matchesCat = name.includes('gà') || name.includes('kfc') || name.includes('lotteria') || name.includes('jollibee') || name.includes('pizza') || name.includes('burger');
      } else if (!matchesCat && kw === 'chè') {
        matchesCat = name.includes('chè') || name.includes('ăn vặt') || name.includes('nem') || name.includes('ốc') || name.includes('cháo') || name.includes('tàu hũ');
      }
      if (!matchesCat) return false;
    }

    if (!query) return true;
    if (name.includes(query) || addr.includes(query) || cat.includes(query)) return true;

    // Also search inside dishes!
    if (Array.isArray(r.dishes)) {
      return r.dishes.some(d => (d.name || '').toLowerCase().includes(query));
    }
    return false;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-10 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
        <p class="font-bold text-slate-600 text-sm">Không tìm thấy quán nào khớp với "${escapeHtml(query)}"</p>
        <p class="text-xs mt-1">Bạn có thể chuyển sang tab <strong>"🔗 Dán Link ShopeeFood"</strong> để quét trực tiếp link quán!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(r => {
    const isCurrent = r.id === state.currentRestaurantId;
    const dishCount = r.dishes?.length || 0;
    const sampleDishes = (r.dishes || []).slice(0, 3).map(d => d.name).join(', ');

    return `
      <div class="p-3.5 rounded-xl border ${isCurrent ? 'border-orange-500 bg-orange-50/40' : 'border-slate-200 bg-white hover:border-orange-300'} shadow-2xs transition-all flex flex-col justify-between gap-2.5">
        <div class="space-y-1">
          <div class="flex items-start justify-between gap-2">
            <h4 class="font-black text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1" title="${escapeHtml(r.name)}">
              ${escapeHtml(r.name)}
            </h4>
            <span class="px-2 py-0.5 text-[10px] font-black rounded-full bg-orange-100 text-orange-700 whitespace-nowrap flex-shrink-0">
              ${dishCount} món
            </span>
          </div>
          <p class="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
            <span>📍 ${escapeHtml(r.address || 'Hà Nội')}</span>
          </p>
          ${sampleDishes ? `<p class="text-[11px] text-slate-400 line-clamp-1 italic">🍽️ ${escapeHtml(sampleDishes)}...</p>` : ''}
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <a href="${escapeHtml(r.shopeeUrl || 'https://shopeefood.vn')}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-semibold text-slate-400 hover:text-orange-600 hover:underline truncate">
            Xem trên ShopeeFood ↗
          </a>
          <button 
            type="button" 
            onclick="selectCatalogRestaurant('${escapeHtml(r.id)}')" 
            class="px-3 py-1.5 rounded-lg text-xs font-black ${isCurrent ? 'bg-emerald-600 text-white' : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white'} shadow-2xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            <span>${isCurrent ? '✓ Đang Chọn' : 'Chọn Quán Này'}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function selectCatalogRestaurant(restId) {
  const catalog = (typeof INITIAL_RESTAURANTS !== 'undefined' && Array.isArray(INITIAL_RESTAURANTS))
    ? INITIAL_RESTAURANTS
    : state.restaurants;

  const found = catalog.find(r => r.id === restId) || state.restaurants.find(r => r.id === restId);
  if (!found) return;

  if (!state.restaurants.some(r => r.id === found.id)) {
    state.restaurants.unshift(found);
    saveRestaurantsToLocal();
  }

  closeAddRestaurantModal();
  changeRestaurant(found.id, true);
  showToast(`🎉 Đã chuyển sang quán "${found.name}" (${found.dishes?.length || 0} món)!`, 'success');
}

// ------------------------------------------------------------------------------
// SMART SERVERLESS SHOPEEFOOD MENU EXTRACTOR (100% Client-side, no start.bat needed)
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// SMART MULTI-STRATEGY SHOPEEFOOD EXTRACTOR (Serverless, Cloud & Local Fallback)
// ------------------------------------------------------------------------------

// Normalize ShopeeFood URL (removes UTM params, tracking, mobile format)
function normalizeShopeeUrl(url) {
  if (!url) return '';
  let clean = url.trim();
  try {
    // Remove query params & hash
    clean = clean.split('?')[0].split('#')[0].replace(/\/+$/, '');
    
    // Replace mobile subdomains
    clean = clean.replace('://m.shopeefood.vn', '://shopeefood.vn');
    clean = clean.replace('://food.shopee.vn', '://shopeefood.vn');
  } catch (e) {}
  return clean;
}

// Convert URL Slug to Human Readable Name
function slugToReadableName(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .filter(w => w.length > 0)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Universal Text Dish Parser (parses text lines into structured dishes & prices)
function parseDishesFromText(rawText, defaultCategory = 'Món Ngon') {
  if (!rawText) return [];
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const dishes = [];
  const seen = new Set();
  let currentCategory = defaultCategory;
  
  // Price regex matching: 15.000, 15000, 15k, 15,000đ, 15.000 vnđ
  const priceRegex = /([0-9]{1,3}(?:[.,][0-9]{3})+|\b[0-9]{2,3}k\b|\b[0-9]{4,6}\b)\s*(?:đ|vnđ|d|k)?/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Filter promo junk
    if (line.match(/^(?:Mã giảm|HOME CREDIT|Đã bán|Đánh giá|Thích|ShopeeFood|Phí giao|Freeship|Copy code|Xem thêm|Tất cả|Voucher|Giảm giá|Image \d+:)/i)) {
      continue;
    }

    // Category detection (ALL CAPS or Markdown header)
    if (line.startsWith('##') || line.startsWith('#') || (line.length >= 3 && line.length <= 40 && line === line.toUpperCase() && !line.match(priceRegex))) {
      currentCategory = line.replace(/^[#\s\-*]+/, '').trim() || defaultCategory;
      continue;
    }

    const pMatch = line.match(priceRegex);
    if (pMatch) {
      const priceNum = parseInt(pMatch[1].toLowerCase().replace(/k/g, '000').replace(/[.,]/g, ''), 10);
      let namePart = line.replace(pMatch[0], '')
        .replace(/^[\d\s.\-–:)]+/, '') // remove leading bullet numbers
        .replace(/[-–:.,\s]+$/, '')
        .trim();

      if (namePart.length >= 2 && priceNum >= 1000 && !seen.has(namePart.toLowerCase())) {
        seen.add(namePart.toLowerCase());
        dishes.push({
          id: 'dish-' + (dishes.length + 1).toString().padStart(2, '0'),
          name: namePart,
          price: priceNum,
          category: currentCategory,
          description: '',
          tag: ''
        });
      }
    }
  }

  return dishes;
}

// Multi-cloud parser for ShopeeFood URLs
async function fetchShopeeMenuFromCloud(url) {
  const cleanUrl = normalizeShopeeUrl(url);
  const urlParts = cleanUrl.split('/').filter(p => p.length > 0);
  const slug = urlParts[urlParts.length - 1] || '';
  const readableNameFromSlug = slugToReadableName(slug);

  let html = '';
  let lastError = null;

  // Strategy 1: Jina AI HTML Reader with Deep Selectors
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000);
    const jinaUrl = 'https://r.jina.ai/' + cleanUrl;
    
    const res = await fetch(jinaUrl, {
      signal: controller.signal,
      headers: {
        'X-Return-Format': 'html',
        'X-Wait-For-Selector': '.item-restaurant-name, .current-price, .restaurant-container, h2, h1, .name-restaurant',
        'X-Timeout': '20'
      }
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      html = await res.text();
    }
  } catch (err) {
    lastError = err;
  }

  // Strategy 2: Jina AI Markdown Fallback (Faster, avoids complex DOM issues)
  if (!html || html.length < 500) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);
      const jinaUrl = 'https://r.jina.ai/' + cleanUrl;
      
      const res = await fetch(jinaUrl, {
        signal: controller.signal,
        headers: {
          'X-Timeout': '15'
        }
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        html = await res.text();
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!html || html.length < 200) {
    throw new Error('Không thể kết nối đến máy chủ ShopeeFood. Vui lòng kiểm tra lại kết nối mạng!');
  }

  // Check if ShopeeFood redirected to Home Page (404 shop or expired URL)
  if (html.includes('Order Đồ ăn in') && html.includes('Food Delivery & Shipping Service') && !html.includes('item-restaurant-name')) {
    throw new Error('Quán ăn không tồn tại hoặc đã thay đổi đường dẫn trên ShopeeFood. Vui lòng mở ShopeeFood.vn để lấy link mới nhất của quán!');
  }

  // 1. Extract Restaurant Name
  let restName = '';
  const nameMatch = html.match(/<h1[^>]*class="[^"]*name-restaurant[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
  if (nameMatch) {
    restName = nameMatch[1].replace(/<[^>]+>/g, '').trim();
  }
  if (!restName) {
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i) || html.match(/Title:\s*([^\n\r]+)/i);
    if (titleMatch) {
      restName = titleMatch[1].split('|')[0].replace(/Order Đồ ăn in.*|Food Delivery.*/i, '').trim();
    }
  }
  if (!restName && readableNameFromSlug) {
    restName = readableNameFromSlug;
  }

  // 2. Extract Address
  let address = '';
  const addrMatch = html.match(/<div[^>]*class="[^"]*address-restaurant[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (addrMatch) {
    address = addrMatch[1].replace(/<[^>]+>/g, '').trim();
  }
  if (!address && cleanUrl.includes('/ha-noi/')) {
    address = 'Hà Nội';
  } else if (!address && cleanUrl.includes('/ho-chi-minh/')) {
    address = 'TP. Hồ Chí Minh';
  } else if (!address && cleanUrl.includes('/da-nang/')) {
    address = 'Đà Nẵng';
  }

  // 3. Extract Category
  let category = 'Món Ăn & Đồ Uống';
  const catMatch = html.match(/<div[^>]*class="[^"]*kind-restaurant[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (catMatch) {
    category = catMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // 4. Extract Dishes: Pattern A (DOM Cards)
  let dishes = [];
  const seen = new Set();
  const dishRegex = /<h2[^>]*class="[^"]*item-restaurant-name[^"]*"[^>]*>([\s\S]*?)<\/h2>(?:\s*<div[^>]*class="[^"]*item-restaurant-desc[^"]*"[^>]*>([\s\S]*?)<\/div>)?[\s\S]*?<div[^>]*class="[^"]*current-price[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  while ((match = dishRegex.exec(html)) !== null) {
    const dName = match[1].replace(/<[^>]+>/g, '').trim();
    const desc = (match[2] || '').replace(/<[^>]+>/g, '').trim();
    const priceRaw = match[3].replace(/<[^>]+>/g, '').replace(/[^\d]/g, '');
    const price = parseInt(priceRaw, 10);

    if (dName && !seen.has(dName.toLowerCase()) && price >= 1000) {
      seen.add(dName.toLowerCase());
      dishes.push({
        id: 'dish-' + (dishes.length + 1).toString().padStart(2, '0'),
        name: dName,
        price: price,
        description: desc,
        category: category,
        tag: ''
      });
    }
  }

  // Pattern B: Text Line Parser Fallback
  if (dishes.length === 0) {
    const plainText = html.replace(/<[^>]+>/g, '\n');
    dishes = parseDishesFromText(plainText, category);
  }

  if (dishes.length === 0) {
    throw new Error('Không tìm thấy danh sách món ăn trong liên kết này. Quán có thể đang tạm nghỉ hoặc link bị thay đổi!');
  }

  return {
    success: true,
    restaurant: {
      name: restName || 'Quán ShopeeFood',
      address: address || 'Hà Nội',
      category: category || 'Món ngon',
      dishes: dishes
    }
  };
}

// Toggle Quick Paste Accordion in Modal
function toggleQuickPasteMenu() {
  const section = document.getElementById('quickPasteSection');
  const toggleText = document.getElementById('quickPasteToggleText');
  if (!section) return;

  if (section.classList.contains('hidden')) {
    section.classList.remove('hidden');
    if (toggleText) toggleText.textContent = '❌ Đóng ô nhập nhanh';
    const ta = document.getElementById('quickPasteTextarea');
    if (ta) ta.focus();
  } else {
    section.classList.add('hidden');
    if (toggleText) toggleText.textContent = '📝 Dán danh sách món / Nhập nhanh';
  }
}

// Parse text from Quick Paste textarea into draftDishes
function parseQuickPasteDishes() {
  const ta = document.getElementById('quickPasteTextarea');
  const text = ta ? ta.value.trim() : '';
  if (!text) {
    showToast('⚠️ Vui lòng dán danh sách món và giá tiền vào ô nhập!', 'warning');
    ta?.focus();
    return;
  }

  const catInput = document.getElementById('newRestCategory');
  const defaultCat = (catInput && catInput.value.trim()) || 'Món ngon';
  const parsed = parseDishesFromText(text, defaultCat);

  if (parsed.length === 0) {
    showToast('⚠️ Không tìm thấy món và giá hợp lệ. Ví dụ: "Trà sữa 30k" hoặc "Cơm sườn - 40.000đ"', 'error');
    return;
  }

  // Merge into draft dishes
  const seen = new Set(state.draftDishes.map(d => d.name.toLowerCase()));
  let addedCount = 0;
  parsed.forEach(p => {
    if (!seen.has(p.name.toLowerCase())) {
      seen.add(p.name.toLowerCase());
      p.id = 'dish-' + (state.draftDishes.length + 1).toString().padStart(2, '0');
      state.draftDishes.push(p);
      addedCount++;
    }
  });

  renderDraftDishes();
  showToast(`🎉 Đã thêm thành công ${addedCount} món vào thực đơn!`, 'success');
  if (ta) ta.value = '';
}

// Scan ShopeeFood URL or Keyword Button (Completely automatic & serverless)
async function updateRestaurantMenuFromUrl() {
  const urlInput = document.getElementById('newRestUrl');
  const rawUrl = urlInput ? urlInput.value.trim() : '';

  if (!rawUrl) {
    showToast('⚠️ Vui lòng dán đường link ShopeeFood hoặc nhập tên quán!', 'warning');
    urlInput?.focus();
    return;
  }

  const cleanUrl = normalizeShopeeUrl(rawUrl);
  const catalog = (typeof INITIAL_RESTAURANTS !== 'undefined') ? INITIAL_RESTAURANTS : (state.restaurants || []);

  // If user typed a keyword instead of a URL, search catalog first!
  if (!cleanUrl.includes('shopeefood.vn') && !cleanUrl.includes('shopee.vn') && !cleanUrl.includes('now.vn') && !cleanUrl.startsWith('http')) {
    const kw = rawUrl.toLowerCase();
    const matchedByName = catalog.find(r => (r.name || '').toLowerCase().includes(kw) || (r.id || '').toLowerCase().includes(kw));
    if (matchedByName && matchedByName.dishes && matchedByName.dishes.length > 0) {
      const nameInput = document.getElementById('newRestName');
      if (nameInput) nameInput.value = matchedByName.name;
      const addrInput = document.getElementById('newRestAddress');
      if (addrInput) addrInput.value = matchedByName.address || '';
      const catInput = document.getElementById('newRestCategory');
      if (catInput) catInput.value = matchedByName.category || 'Món ăn';
      if (urlInput) urlInput.value = matchedByName.shopeeUrl || '';

      state.draftDishes = JSON.parse(JSON.stringify(matchedByName.dishes));
      renderDraftDishes();
      showToast(`✨ Đã nạp thực đơn chuẩn 100% của quán "${matchedByName.name}" (${matchedByName.dishes.length} món)!`, 'success');
      return;
    }

    showToast('⚠️ Vui lòng nhập link từ ShopeeFood.vn hoặc chọn quán trong tab Kho Quán ShopeeFood!', 'warning');
    return;
  }

  const btn = document.getElementById('btnFetchShopeeMenu');
  const btnText = document.getElementById('fetchShopeeText');
  const btnIcon = document.getElementById('fetchShopeeIcon');

  if (btn) btn.disabled = true;
  if (btnIcon) btnIcon.classList.add('animate-spin');
  if (btnText) btnText.textContent = 'Đang quét thực đơn ShopeeFood...';

  try {
    // Normalize URL for matching
    const urlLower = cleanUrl.toLowerCase();
    const urlParts = cleanUrl.split('/').filter(p => p.length > 0);
    const slug = (urlParts[urlParts.length - 1] || '').toLowerCase();
    const slugTokens = slug.split('-').filter(t => t.length >= 2);

    // 1. Check if URL matches existing saved catalog restaurants (Exact or Fuzzy Slug Match - Instant 0ms)
    let matched = catalog.find(r => {
      if (!r.shopeeUrl) return false;
      const rUrl = normalizeShopeeUrl(r.shopeeUrl).toLowerCase();
      return rUrl === urlLower || (slug && rUrl.endsWith('/' + slug)) || (r.id && r.id.toLowerCase() === slug);
    });

    // Fuzzy token match against catalog if exact slug didn't match (e.g. tra-sua-mixue-kim-giang -> matches Mixue)
    if (!matched && slugTokens.length >= 2) {
      let bestScore = 0;
      catalog.forEach(r => {
        const hay = ((r.id || '') + ' ' + (r.shopeeUrl || '') + ' ' + (r.name || '')).toLowerCase();
        let hits = 0;
        slugTokens.forEach(tok => {
          if (hay.includes(tok)) hits++;
        });
        const ratio = hits / slugTokens.length;
        if (hits >= 2 && ratio >= 0.6 && ratio > bestScore) {
          bestScore = ratio;
          matched = r;
        }
      });
    }

    if (matched && matched.dishes && matched.dishes.length > 0) {
      const nameInput = document.getElementById('newRestName');
      if (nameInput) nameInput.value = matched.name;

      const addrInput = document.getElementById('newRestAddress');
      if (addrInput) addrInput.value = matched.address || '';

      const catInput = document.getElementById('newRestCategory');
      if (catInput) catInput.value = matched.category || 'Món ăn';

      state.draftDishes = JSON.parse(JSON.stringify(matched.dishes));
      renderDraftDishes();
      showToast(`✨ Đã nạp thực đơn chuẩn 100% của quán "${matched.name}" (${matched.dishes.length} món)!`, 'success');
      return;
    }

    // 2. Try Serverless Cloud Scraper (Direct from browser on GitHub Pages)
    try {
      const cloudData = await fetchShopeeMenuFromCloud(cleanUrl);
      if (cloudData && cloudData.success && cloudData.restaurant && cloudData.restaurant.dishes.length > 0) {
        const r = cloudData.restaurant;
        const nameInput = document.getElementById('newRestName');
        if (nameInput) nameInput.value = r.name || '';

        const addrInput = document.getElementById('newRestAddress');
        if (addrInput) addrInput.value = r.address || '';

        const catInput = document.getElementById('newRestCategory');
        if (catInput) catInput.value = r.category || 'Món ngon';

        state.draftDishes = r.dishes;
        renderDraftDishes();
        showToast(`🎉 Trích xuất thành công ${r.dishes.length} món từ ShopeeFood!`, 'success');
        return;
      }
    } catch (cloudErr) {
      // If error indicates home page redirect or expired link, throw to inform user directly
      if (cloudErr.message && (cloudErr.message.includes('không tồn tại') || cloudErr.message.includes('thay đổi đường dẫn'))) {
        throw cloudErr;
      }
    }

    // 3. Try Local Server Scraper (/api/fetch-shopee-menu) if start.bat happens to be running
    try {
      const res = await apiFetch('/api/fetch-shopee-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
        timeout: 25000
      });

      if (res && res.ok) {
        const data = await res.json();
        let restData = data;
        if (Array.isArray(data)) {
          restData = data.find(d => d && typeof d === 'object' && d.restaurant) || data[data.length - 1] || {};
        }

        if (restData.success && restData.restaurant && Array.isArray(restData.restaurant.dishes) && restData.restaurant.dishes.length > 0) {
          const r = restData.restaurant;
          const nameInput = document.getElementById('newRestName');
          if (nameInput) nameInput.value = r.name || '';

          const addrInput = document.getElementById('newRestAddress');
          if (addrInput) addrInput.value = r.address || '';

          const catInput = document.getElementById('newRestCategory');
          if (catInput) catInput.value = r.category || 'Món ngon';
          
          state.draftDishes = r.dishes;
          renderDraftDishes();
          showToast(`✅ Đã tải chính xác 100% (${r.dishes.length} món) từ ShopeeFood!`, 'success');
          return;
        }
      }
    } catch (apiErr) {}

    // 4. Fallback: Suggest checking URL or using quick paste
    showToast('⚠️ Không tìm thấy thực đơn từ đường link này. Quán có thể đã đổi link trên ShopeeFood hoặc bạn có thể bấm "Dán danh sách món" để nhập nhanh!', 'error');

  } catch (err) {
    showToast(`⚠️ ${err.message || 'Không thể trích xuất thực đơn'}`, 'error');
  } finally {
    if (btn) btn.disabled = false;
    if (btnIcon) btnIcon.classList.remove('animate-spin');
    if (btnText) btnText.textContent = 'Cập nhật thực đơn quán';
    if (window.lucide) window.lucide.createIcons();
  }
}

// Render Draft Dishes Preview Table in Add Modal
function renderDraftDishes() {
  const container = document.getElementById('draftDishesList');
  const countBadge = document.getElementById('draftDishCount');

  if (countBadge) countBadge.textContent = state.draftDishes.length;
  if (!container) return;

  if (state.draftDishes.length === 0) {
    container.innerHTML = `
      <p class="text-slate-400 italic text-center py-4">Chưa có món nào. Vui lòng dán link ShopeeFood và bấm "Cập nhật thực đơn quán".</p>
    `;
    return;
  }

  container.innerHTML = state.draftDishes.map((dish, idx) => `
    <div class="flex items-center justify-between py-1.5 px-2 hover:bg-white rounded transition-colors group">
      <div class="flex items-center space-x-2">
        <span class="text-slate-400 font-bold w-5 text-right">${idx + 1}.</span>
        <span class="font-bold text-slate-800 text-xs">${escapeHtml(dish.name)}</span>
        ${dish.category ? `<span class="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">${escapeHtml(dish.category)}</span>` : ''}
      </div>

      <div class="flex items-center space-x-3">
        <span class="font-black text-orange-600 text-xs">${formatVND(dish.price)}</span>
        <button onclick="deleteDraftDish(${idx})" class="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer" title="Xóa món này">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function deleteDraftDish(index) {
  if (index >= 0 && index < state.draftDishes.length) {
    state.draftDishes.splice(index, 1);
    renderDraftDishes();
  }
}

// Save New Restaurant and Switch to it Immediately
async function saveNewRestaurant() {
  const nameInput = document.getElementById('newRestName');
  const name = nameInput ? nameInput.value.trim() : '';
  const url = document.getElementById('newRestUrl')?.value.trim() || '';
  const category = document.getElementById('newRestCategory')?.value.trim() || 'Món ăn & Đồ uống';
  const address = document.getElementById('newRestAddress')?.value.trim() || 'Hà Nội';

  if (!name) {
    showToast('⚠️ Vui lòng nhập tên quán ăn!', 'warning');
    nameInput?.focus();
    return;
  }

  if (state.draftDishes.length === 0) {
    showToast('⚠️ Vui lòng thêm ít nhất 1 món ăn vào thực đơn quán!', 'warning');
    return;
  }

  const newId = 'rest-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);

  const newRestaurant = {
    id: newId,
    name: name,
    category: category,
    address: address,
    timeOpen: '09:00 - 22:30',
    rating: '5.0',
    shopeeUrl: url || 'https://shopeefood.vn',
    dishes: state.draftDishes.map((d, i) => ({
      id: d.id || `dish-${(i + 1).toString().padStart(2, '0')}`,
      name: d.name,
      price: parseInt(d.price) || 30000,
      category: d.category || 'Món ngon',
      description: d.description || '',
      tag: d.tag || ''
    }))
  };

  const existingIdx = state.restaurants.findIndex(r => r.name.toLowerCase() === name.toLowerCase());
  if (existingIdx >= 0) {
    state.restaurants[existingIdx] = newRestaurant;
  } else {
    state.restaurants.unshift(newRestaurant);
  }

  saveRestaurantsToLocal();

  broadcastMqtt(MQTT_TOPIC_RESTAURANTS, {
    type: 'RESTAURANT_SAVED',
    restaurant: newRestaurant
  });

  try {
    await apiFetch('/api/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRestaurant)
    });
  } catch (e) {}

  closeAddRestaurantModal();
  changeRestaurant(newRestaurant.id, true);
  showToast(`🎉 Đã lưu và chọn quán: "${newRestaurant.name}"!`, 'success');
}

// ------------------------------------------------------------------------------
// UTILITY HELPERS
// ------------------------------------------------------------------------------

function formatVND(amount) {
  const num = parseInt(amount, 10);
  if (isNaN(num)) return '0 ₫';
  return num.toLocaleString('vi-VN') + ' ₫';
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-600 text-white shadow-emerald-500/20',
    warning: 'bg-amber-500 text-white shadow-amber-500/20',
    error: 'bg-red-600 text-white shadow-red-500/20',
    info: 'bg-slate-900 text-white shadow-slate-900/20'
  };

  const bgClass = bgColors[type] || bgColors.info;
  toast.className = `${bgClass} px-4 py-2.5 rounded-xl shadow-lg text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
