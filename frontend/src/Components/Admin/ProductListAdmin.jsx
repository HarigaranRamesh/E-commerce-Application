import React, { useEffect, useState, useCallback, useRef } from 'react';
import { productsAPI } from '../../services/api';
import { Edit2, Trash2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ProductListAdmin = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const searchTimerRef = useRef(null);

    const fetchProducts = useCallback(async (targetPage = page, search = searchTerm, category = categoryFilter, stock = stockFilter, sort = sortBy) => {
        setLoading(true);
        try {
            const params = {
                page: targetPage,
                limit,
                search: search.trim() || undefined,
                category: category !== 'all' ? category : undefined,
                inStock: stock === 'inStock' ? 'true' : undefined,
                sort,
            };
            const response = await productsAPI.getAll(params);
            if (response.data && response.data.products) {
                let list = response.data.products;
                if (stock === 'outOfStock') {
                    list = list.filter((p) => (p.stock || 0) <= 0);
                }
                setProducts(list);
                setPage(response.data.page || 1);
                setPages(response.data.pages || 1);
                setTotal(response.data.total || list.length);
            } else {
                const list = Array.isArray(response.data) ? response.data : [];
                setProducts(list);
                setTotal(list.length);
                setPages(1);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, categoryFilter, stockFilter, sortBy]);

    useEffect(() => {
        fetchProducts(page, searchTerm, categoryFilter, stockFilter, sortBy);
    }, [page, categoryFilter, stockFilter, sortBy]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setPage(1);
            fetchProducts(1, val, categoryFilter, stockFilter, sortBy);
        }, 300);
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productsAPI.delete(id);
                toast.success('Product deleted successfully');
                fetchProducts(page, searchTerm, categoryFilter, stockFilter, sortBy);
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error(error.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    return (
        <div>
            <div className="admin-page-header">
                <h2>Products Management {total > 0 ? `(${total})` : ''}</h2>
                <Link to="/admin/product/new" className="btn btn-primary btn-with-icon">
                    <Plus size={18} /> Create Product
                </Link>
            </div>

            {/* Filter, Search & Sort Toolbar */}
            <div className="admin-filter-bar">
                <div className="admin-search-input-wrap">
                    <Search size={16} />
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search product name, brand or SKU..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="admin-filter-group">
                    {/* Category Filter */}
                    <select
                        className="admin-select"
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Categories</option>
                        <option value="shirts">Shirts</option>
                        <option value="t-shirts">T-Shirts</option>
                        <option value="pants">Pants & Trousers</option>
                        <option value="hoodies">Hoodies</option>
                        <option value="dresses">Dresses</option>
                        <option value="ethnic">Ethnic Wear</option>
                        <option value="tops">Tops</option>
                        <option value="boys">Boys</option>
                        <option value="girls">Girls</option>
                    </select>

                    {/* Stock Status Filter */}
                    <select
                        className="admin-select"
                        value={stockFilter}
                        onChange={(e) => {
                            setStockFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Stock Status</option>
                        <option value="inStock">In Stock Only</option>
                        <option value="outOfStock">Out of Stock Only</option>
                    </select>

                    {/* Sorting Dropdown */}
                    <select
                        className="admin-select"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div className="loader"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <p style={{ fontSize: '1rem', margin: 0 }}>No products found matching your filters.</p>
                    </div>
                ) : (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Brand</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id || product.id}>
                                        <td>
                                            <img
                                                src={product.image || 'https://via.placeholder.com/48'}
                                                alt={product.name}
                                                style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{product.name}</div>
                                            {product.sku && (
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {product.sku}</span>
                                            )}
                                        </td>
                                        <td style={{ textTransform: 'capitalize' }}>{product.category}</td>
                                        <td>{product.brand || 'Clothings Store'}</td>
                                        <td>₹{Number(product.price || 0).toLocaleString('en-IN')}</td>
                                        <td>
                                            {product.stock <= 0 ? (
                                                <span className="status-badge status-cancelled">Out of Stock</span>
                                            ) : product.stock <= 5 ? (
                                                <span className="status-badge status-pending">Low: {product.stock} left</span>
                                            ) : (
                                                <span className="status-badge status-delivered">{product.stock} in stock</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="admin-actions">
                                                <Link to={`/admin/product/${product._id || product.id}/edit`} className="btn-icon" title="Edit Product">
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    className="btn-icon delete"
                                                    onClick={() => deleteHandler(product._id || product.id)}
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {pages > 1 && (
                            <div className="admin-pagination">
                                <span>
                                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} products
                                </span>
                                <div className="admin-pagination-pages">
                                    <button
                                        type="button"
                                        className="admin-page-btn"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                        title="Previous Page"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            className={`admin-page-btn ${page === p ? 'active' : ''}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        className="admin-page-btn"
                                        disabled={page >= pages}
                                        onClick={() => setPage((p) => Math.min(p + 1, pages))}
                                        title="Next Page"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductListAdmin;
