import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productAPI, addressAPI, redemptionAPI } from '../api';
import './Shop.css';

const Shop = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // 載入商品列表
  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data.products);
    } catch (error) {
      console.error('載入商品失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 載入地址列表
  const loadAddresses = async () => {
    try {
      const response = await addressAPI.getAll();
      setAddresses(response.data);
      // 自動選擇預設地址
      const defaultAddr = response.data.find(addr => addr.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      } else if (response.data.length > 0) {
        setSelectedAddress(response.data[0].id);
      }
    } catch (error) {
      console.error('載入地址失敗:', error);
    }
  };

  // 開啟兌換視窗
  const handleOpenRedeemModal = (product) => {
    setSelectedProduct(product);
    setShowRedeemModal(true);
    setQuantity(1);
    setNotes('');
  };

  // 關閉兌換視窗
  const handleCloseRedeemModal = () => {
    setShowRedeemModal(false);
    setSelectedProduct(null);
  };

  // 兌換商品
  const handleRedeem = async () => {
    if (!selectedProduct || !selectedAddress) {
      alert('請選擇商品和收件地址');
      return;
    }

    const totalPoints = selectedProduct.merit_points * quantity;
    if (user.blessing_points < totalPoints) {
      alert(`功德值不足！需要 ${totalPoints} 點，目前有 ${user.blessing_points} 點`);
      return;
    }

    try {
      await redemptionAPI.create({
        product_id: selectedProduct.id,
        quantity: quantity,
        address_id: selectedAddress,
        notes: notes
      });
      alert('兌換成功！');
      handleCloseRedeemModal();
      // 重新載入用戶資訊以更新功德值
      window.location.reload();
    } catch (error) {
      alert('兌換失敗：' + (error.error || '未知錯誤'));
    }
  };

  useEffect(() => {
    loadProducts();
    loadAddresses();
  }, []);

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="shop">
      <header className="shop-header">
        <h1>功德商城</h1>
        <div className="user-info">
          <span className="points-display">
            功德值: <strong>{user?.blessing_points || 0}</strong>
          </span>
          <span>|</span>
          <span>{user?.name}</span>
          <button onClick={logout} className="btn-logout">登出</button>
        </div>
      </header>

      <nav className="shop-nav">
        <a href="/dashboard">← 返回主頁</a>
      </nav>

      <div className="shop-content">
        <section className="products-section">
          <h2>商品列表</h2>
          <div className="products-grid">
            {products.length === 0 ? (
              <p className="empty-message">目前沒有商品</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <div className="placeholder-image">📦</div>
                    )}
                    {product.is_featured && <span className="badge-featured">推薦</span>}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    {product.description && (
                      <p className="product-description">{product.description}</p>
                    )}
                    <div className="product-meta">
                      <span className="product-category">{product.category}</span>
                      <span className="product-stock">
                        庫存: {product.stock_quantity}
                      </span>
                    </div>
                    <div className="product-footer">
                      <span className="product-price">
                        {product.merit_points} 功德值
                      </span>
                      <button
                        className="btn-redeem"
                        onClick={() => handleOpenRedeemModal(product)}
                        disabled={product.stock_quantity === 0 || !product.is_active}
                      >
                        {product.stock_quantity === 0 ? '已售完' : '立即兌換'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 兌換視窗 */}
      {showRedeemModal && selectedProduct && (
        <div className="modal-overlay" onClick={handleCloseRedeemModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>兌換商品</h2>
            <div className="modal-body">
              <div className="redeem-product-info">
                <h3>{selectedProduct.name}</h3>
                <p>單價: {selectedProduct.merit_points} 功德值</p>
              </div>

              <div className="form-group">
                <label>數量:</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stock_quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div className="form-group">
                <label>收件地址:</label>
                {addresses.length === 0 ? (
                  <p className="text-warning">請先添加收件地址</p>
                ) : (
                  <select
                    value={selectedAddress || ''}
                    onChange={(e) => setSelectedAddress(parseInt(e.target.value))}
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.recipient_name} - {addr.full_address}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>備註:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="有什麼特殊需求嗎？（選填）"
                  rows="3"
                />
              </div>

              <div className="redeem-summary">
                <p>總計: <strong>{selectedProduct.merit_points * quantity}</strong> 功德值</p>
                <p>剩餘: <strong>{user.blessing_points - (selectedProduct.merit_points * quantity)}</strong> 功德值</p>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseRedeemModal} className="btn-cancel">
                取消
              </button>
              <button
                onClick={handleRedeem}
                className="btn-confirm"
                disabled={addresses.length === 0}
              >
                確認兌換
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
