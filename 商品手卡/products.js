// 产品数据管理 - 使用 localStorage 存储
const STORAGE_KEY = 'fanghuichuntang_products';
const SESSION_KEY = 'fanghuichuntang_session';

// 默认空数据结构
const defaultProducts = {
  tea: [],
  ointment: []
};

// 管理员密码（明文）
const ADMIN_PASSWORD = 'admin123';

// 验证管理员密码
function verifyAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}

// 保存登录会话
function saveLoginSession(role, username) {
  const session = {
    role,
    username,
    timestamp: Date.now()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// 获取当前登录会话
function getLoginSession() {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const session = JSON.parse(stored);
      // 检查会话是否过期（24小时）
      if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
        return session;
      } else {
        // 会话过期，清除
        localStorage.removeItem(SESSION_KEY);
      }
    }
  } catch (e) {
    console.error('读取会话失败:', e);
  }
  return null;
}

// 清除登录会话
function clearLoginSession() {
  localStorage.removeItem(SESSION_KEY);
}

// 检查是否登录
function isLoggedIn() {
  return getLoginSession() !== null;
}

// 检查是否为管理员
function isAdmin() {
  const session = getLoginSession();
  return session && session.role === 'admin';
}

// 检查是否为达人
function isInfluencer() {
  const session = getLoginSession();
  return session && session.role === 'influencer';
}

// 获取所有产品（从 localStorage）
function getAllProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // 初始化空数据
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
  } catch (e) {
    console.error('读取产品数据失败:', e);
    return defaultProducts;
  }
}

// 保存所有产品（到 localStorage）
function saveAllProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('保存产品数据失败:', e);
  }
}

// 保存单个产品
function saveProduct(product) {
  const allProducts = getAllProducts();
  
  if (product.category === 'tea') {
    const index = allProducts.tea.findIndex(p => p.id === product.id);
    if (index >= 0) {
      allProducts.tea[index] = product;
    } else {
      allProducts.tea.push(product);
    }
  } else {
    const index = allProducts.ointment.findIndex(p => p.id === product.id);
    if (index >= 0) {
      allProducts.ointment[index] = product;
    } else {
      allProducts.ointment.push(product);
    }
  }
  
  saveAllProducts(allProducts);
}

// 获取所有热门产品（各分类取前4个）
function getHotProducts() {
  const allProducts = getAllProducts();
  return [
    ...allProducts.tea.slice(0, 4),
    ...allProducts.ointment.slice(0, 4)
  ];
}

// 获取茶包子分类
function getTeaSubCategories() {
  const allProducts = getAllProducts();
  const categories = [...new Set(allProducts.tea.map(p => p.subCategory))];
  return ['全部', ...categories];
}

// 获取膏方子分类
function getOintmentSubCategories() {
  const allProducts = getAllProducts();
  const categories = [...new Set(allProducts.ointment.map(p => p.subCategory))];
  return ['全部', ...categories];
}

// 根据分类筛选茶包
function filterTeaBySubCategory(subCategory) {
  const allProducts = getAllProducts();
  if (subCategory === '全部') return allProducts.tea;
  return allProducts.tea.filter(p => p.subCategory === subCategory);
}

// 根据分类筛选膏方
function filterOintmentBySubCategory(subCategory) {
  const allProducts = getAllProducts();
  if (subCategory === '全部') return allProducts.ointment;
  return allProducts.ointment.filter(p => p.subCategory === subCategory);
}

// 根据ID获取产品
function getProductById(id) {
  const allProducts = getAllProducts();
  const products = [...allProducts.tea, ...allProducts.ointment];
  return products.find(p => p.id === id);
}

// 获取茶包产品列表
function getTeaProducts() {
  const allProducts = getAllProducts();
  return allProducts.tea;
}

// 获取膏方产品列表
function getOintmentProducts() {
  const allProducts = getAllProducts();
  return allProducts.ointment;
}

// 图片上传处理（转为Base64）
function handleImageUpload(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    // 压缩图片
    compressImage(e.target.result, 800, 0.8, function(compressedBase64) {
      callback(compressedBase64);
    });
  };
  reader.readAsDataURL(file);
}

// 压缩图片
function compressImage(base64, maxWidth, quality, callback) {
  const img = new Image();
  img.src = base64;
  img.onload = function() {
    let width = img.width;
    let height = img.height;
    
    // 等比缩放
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // 输出压缩后的Base64
    const compressed = canvas.toDataURL('image/jpeg', quality);
    callback(compressed);
  };
}
