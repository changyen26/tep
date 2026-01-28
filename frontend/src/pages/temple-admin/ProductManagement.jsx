import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockTempleAdminAPI, mockProducts as initialMockProducts } from '../../mocks/templeAdminMockData';
import './ProductManagement.css';

const USE_MOCK = true; // 設為 false 使用真實 API

// 本地 mock 資料（可修改）
let mockProductsData = [...initialMockProducts];

const ProductManagement = () => {
  const { templeId } = useParams();

  // 商品列表狀態
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 篩選狀態
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal 狀態
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create or edit
  const [currentProduct, setCurrentProduct] = useState(null);

  // 刪除確認狀態
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    merit_points: '',
    stock_quantity: '',
    low_stock_threshold: 5,
    images: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // 圖片上傳狀態
  const [uploading, setUploading] = useState(false);

  // 商品類別選項
  const categories = [
    { value: 'charm', label: '平安符' },
    { value: 'tshirt', label: 'T恤' },
    { value: 'sticker', label: '貼紙' },
    { value: 'accessory', label: '配飾' },
    { value: 'book', label: '書籍' },
    { value: 'other', label: '其他' },
  ];

  // 載入商品列表
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: pageSize,
      };

      if (keyword) params.keyword = keyword;
      if (selectedCategory) params.category = selectedCategory;

      if (USE_MOCK) {
        // 使用 Mock 資料
        await new Promise(resolve => setTimeout(resolve, 300));
        let filtered = [...mockProductsData];

        if (params.keyword) {
          const kw = params.keyword.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(kw));
        }

        if (params.category) {
          filtered = filtered.filter(p => p.category === params.category);
        }

        const start = (params.page - 1) * params.per_page;
        const paginated = filtered.slice(start, start + params.per_page);

        setProducts(paginated);
        setTotal(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
        const response = await templeAdminApi.products.list(templeId, params);

        if (response.success) {
          setProducts(response.data.products || []);
          setTotal(response.data.total || 0);
          setTotalPages(Math.ceil((response.data.total || 0) / pageSize));
        }
      }
    } catch (err) {
      console.error('載入商品列表失敗:', err);
      setError('載入商品列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 初始載入和篩選變更時重新載入
  useEffect(() => {
    if (templeId) {
      fetchProducts();
    }
  }, [templeId, currentPage, keyword, selectedCategory]);

  // 開啟新增 Modal
  const handleCreate = () => {
    setModalMode('create');
    setCurrentProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      merit_points: '',
      stock_quantity: '',
      low_stock_threshold: 5,
      images: [],
    });
    setFormErrors({});
    setShowModal(true);
  };

  // 開啟編輯 Modal
  const handleEdit = (product) => {
    setModalMode('edit');
    setCurrentProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      merit_points: product.merit_points || '',
      stock_quantity: product.stock_quantity || '',
      low_stock_threshold: product.low_stock_threshold || 5,
      images: product.images || [],
    });
    setFormErrors({});
    setShowModal(true);
  };

  // 關閉 Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      merit_points: '',
      stock_quantity: '',
      low_stock_threshold: 5,
      images: [],
    });
    setFormErrors({});
  };

  // 表單欄位變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 清除該欄位的錯誤
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // 驗證表單
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = '商品名稱為必填';
    }

    if (!formData.category) {
      errors.category = '商品類別為必填';
    }

    if (!formData.merit_points || formData.merit_points <= 0) {
      errors.merit_points = '請輸入有效的功德點數';
    }

    if (formData.stock_quantity === '' || formData.stock_quantity < 0) {
      errors.stock_quantity = '請輸入有效的庫存數量';
    }

    if (formData.low_stock_threshold === '' || formData.low_stock_threshold < 0) {
      errors.low_stock_threshold = '請輸入有效的庫存警告值';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 圖片上傳
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);

      if (USE_MOCK) {
        // Mock 上傳：使用隨機圖片 URL
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockUrls = files.map((_, index) =>
          `https://picsum.photos/200/200?random=${Date.now() + index}`
        );
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...mockUrls],
        }));
      } else {
        const { uploadAPI } = await import('../../api/upload');
        const uploadPromises = files.map(async (file) => {
          const formDataObj = new FormData();
          formDataObj.append('file', file);
          formDataObj.append('type', 'product');

          const response = await uploadAPI.uploadFile(formDataObj);
          if (response.success) {
            return response.data.url;
          }
          return null;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedUrls.filter((url) => url !== null);

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...validUrls],
        }));
      }
    } catch (err) {
      console.error('圖片上傳失敗:', err);
      alert('圖片上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
    }
  };

  // 刪除圖片
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        merit_points: parseInt(formData.merit_points, 10),
        stock_quantity: parseInt(formData.stock_quantity, 10),
        low_stock_threshold: parseInt(formData.low_stock_threshold, 10),
        images: formData.images,
        is_active: true,
      };

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));

        if (modalMode === 'create') {
          const newProduct = {
            id: Math.max(...mockProductsData.map(p => p.id), 0) + 1,
            ...data,
            created_at: new Date().toISOString(),
          };
          mockProductsData.push(newProduct);
        } else {
          const index = mockProductsData.findIndex(p => p.id === currentProduct.id);
          if (index !== -1) {
            mockProductsData[index] = { ...mockProductsData[index], ...data };
          }
        }

        handleCloseModal();
        fetchProducts();
        alert(modalMode === 'create' ? '商品新增成功' : '商品更新成功');
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
        let response;
        if (modalMode === 'create') {
          response = await templeAdminApi.products.create(templeId, data);
        } else {
          response = await templeAdminApi.products.update(templeId, currentProduct.id, data);
        }

        if (response.success) {
          handleCloseModal();
          fetchProducts();
          alert(modalMode === 'create' ? '商品新增成功' : '商品更新成功');
        }
      }
    } catch (err) {
      console.error('提交失敗:', err);
      alert(modalMode === 'create' ? '商品新增失敗' : '商品更新失敗');
    } finally {
      setSubmitting(false);
    }
  };

  // 開啟刪除確認
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  // 確認刪除
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        mockProductsData = mockProductsData.filter(p => p.id !== productToDelete.id);
        setShowDeleteConfirm(false);
        setProductToDelete(null);
        fetchProducts();
        alert('商品刪除成功');
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
        const response = await templeAdminApi.products.delete(templeId, productToDelete.id);
        if (response.success) {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
          fetchProducts();
          alert('商品刪除成功');
        }
      }
    } catch (err) {
      console.error('刪除失敗:', err);
      alert('商品刪除失敗');
    }
  };

  // 取消刪除
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  // 搜尋處理
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  // 重置篩選
  const handleReset = () => {
    setKeyword('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 獲取類別名稱
  const getCategoryLabel = (value) => {
    const category = categories.find((c) => c.value === value);
    return category ? category.label : value;
  };

  return (
    <div className="product-management">
      {/* 頁面標題與操作 */}
      <div className="page-header">
        <h1 className="page-title">商品管理</h1>
        <button type="button" className="btn-primary" onClick={handleCreate}>
          新增商品
        </button>
      </div>

      {/* 搜尋與篩選 */}
      <div className="filter-section">
        <div className="filter-form">
          <div className="filter-group">
            <label>搜尋商品</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="輸入商品名稱"
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>商品類別</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">全部類別</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button type="button" className="btn-secondary" onClick={handleSearch}>
              搜尋
            </button>
            <button type="button" className="btn-ghost" onClick={handleReset}>
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="products-section">
        {loading ? (
          <p className="loading-message">載入中...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : products.length === 0 ? (
          <p className="empty-message">目前沒有商品</p>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>商品名稱</th>
                    <th>類別</th>
                    <th>功德點數</th>
                    <th>庫存數量</th>
                    <th>庫存警告</th>
                    <th>狀態</th>
                    <th>建立日期</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{getCategoryLabel(product.category)}</td>
                      <td>{product.merit_points}</td>
                      <td>
                        <span
                          className={
                            product.stock_quantity <= product.low_stock_threshold
                              ? 'stock-low'
                              : 'stock-normal'
                          }
                        >
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td>{product.low_stock_threshold}</td>
                      <td>
                        <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                          {product.is_active ? '啟用' : '停用'}
                        </span>
                      </td>
                      <td>{formatDate(product.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn-link"
                            onClick={() => handleEdit(product)}
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            className="btn-link btn-danger"
                            onClick={() => handleDeleteClick(product)}
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  上一頁
                </button>
                <span className="pagination-info">
                  第 {currentPage} / {totalPages} 頁（共 {total} 筆）
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一頁
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 新增/編輯 Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? '新增商品' : '編輯商品'}
              </h2>
              <button type="button" className="modal-close" onClick={handleCloseModal}>
                關閉
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>
                  商品名稱 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                  placeholder="請輸入商品名稱"
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label>商品描述</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="4"
                  placeholder="請輸入商品描述"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    商品類別 <span className="required">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`form-select ${formErrors.category ? 'error' : ''}`}
                  >
                    <option value="">請選擇類別</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <span className="error-message">{formErrors.category}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    功德點數 <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="merit_points"
                    value={formData.merit_points}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.merit_points ? 'error' : ''}`}
                    placeholder="請輸入功德點數"
                    min="0"
                  />
                  {formErrors.merit_points && (
                    <span className="error-message">{formErrors.merit_points}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    庫存數量 <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.stock_quantity ? 'error' : ''}`}
                    placeholder="請輸入庫存數量"
                    min="0"
                  />
                  {formErrors.stock_quantity && (
                    <span className="error-message">{formErrors.stock_quantity}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    庫存警告值 <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.low_stock_threshold ? 'error' : ''}`}
                    placeholder="請輸入庫存警告值"
                    min="0"
                  />
                  {formErrors.low_stock_threshold && (
                    <span className="error-message">{formErrors.low_stock_threshold}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>商品圖片</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="file-input"
                    disabled={uploading}
                  />
                  {uploading && <p className="upload-status">上傳中...</p>}

                  {formData.images.length > 0 && (
                    <div className="image-preview-list">
                      {formData.images.map((url, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={url} alt={`商品圖片 ${index + 1}`} />
                          <button
                            type="button"
                            className="image-remove-btn"
                            onClick={() => handleRemoveImage(index)}
                          >
                            移除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  取消
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '儲存中...' : '儲存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 刪除確認 Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">確認刪除</h2>
            </div>
            <div className="modal-body">
              <p>確定要刪除商品「{productToDelete?.name}」嗎？</p>
              <p className="warning-text">此操作無法復原</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={handleCancelDelete}>
                取消
              </button>
              <button type="button" className="btn-danger" onClick={handleConfirmDelete}>
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
