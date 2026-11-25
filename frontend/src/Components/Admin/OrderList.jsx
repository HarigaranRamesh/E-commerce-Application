import React, { useEffect, useState, useCallback, useRef } from 'react';
import { adminAPI, ordersAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, Search, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' },
];

const ORDER_STATUS_ACTIONS = STATUS_OPTIONS.filter((s) => s.value !== 'all');

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const searchTimerRef = useRef(null);

    const fetchOrders = useCallback(async (targetPage = page, search = searchTerm, status = statusFilter, payment = paymentFilter, sort = sortBy) => {
        setLoading(true);
        try {
            const params = {
                page: targetPage,
                limit,
                search: search.trim() || undefined,
                status: status !== 'all' ? status : undefined,
                isPaid: payment === 'paid' ? 'true' : payment === 'unpaid' ? 'false' : undefined,
                sort,
            };
            const response = await adminAPI.getOrders(params);
            if (response.data && response.data.orders) {
                setOrders(response.data.orders);
                setPage(response.data.page || 1);
                setPages(response.data.pages || 1);
                setTotal(response.data.total || 0);
            } else {
                const list = Array.isArray(response.data) ? response.data : [];
                setOrders(list);
                setTotal(list.length);
                setPages(1);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, statusFilter, paymentFilter, sortBy]);

    useEffect(() => {
        fetchOrders(page, searchTerm, statusFilter, paymentFilter, sortBy);
    }, [page, statusFilter, paymentFilter, sortBy]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setPage(1);
            fetchOrders(1, val, statusFilter, paymentFilter, sortBy);
        }, 300);
    };

    const handleStatusSelect = async (id, newStatus) => {
        try {
            await ordersAPI.updateStatus(id, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders(page, searchTerm, statusFilter, paymentFilter, sortBy);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update order status');
        }
    };

    return (
        <div>
            <div className="admin-page-header">
                <h2>Orders Management {total > 0 ? `(${total})` : ''}</h2>
            </div>

            {/* Filter, Search & Sort Toolbar */}
            <div className="admin-filter-bar">
                <div className="admin-search-input-wrap">
                    <Search size={16} />
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search by Order ID, invoice, name or email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="admin-filter-group">
                    {/* Status Filter */}
                    <select
                        className="admin-select"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* Payment Filter */}
                    <select
                        className="admin-select"
                        value={paymentFilter}
                        onChange={(e) => {
                            setPaymentFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Payments</option>
                        <option value="paid">Paid Only</option>
                        <option value="unpaid">Unpaid / COD</option>
                    </select>

                    {/* Sort Dropdown */}
                    <select
                        className="admin-select"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="newest">Date: Newest First</option>
                        <option value="oldest">Date: Oldest First</option>
                        <option value="total_high">Total: High to Low</option>
                        <option value="total_low">Total: Low to High</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div className="loader"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <p style={{ fontSize: '1rem', margin: 0 }}>No orders found matching your filters.</p>
                    </div>
                ) : (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Lifecycle Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id}>
                                        <td>
                                            <strong>#{String(order.id || order._id).substring(0, 8).toUpperCase()}</strong>
                                            {order.invoiceNumber && (
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                                                    {order.invoiceNumber}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>
                                                {order.user?.name || order.user_name || 'Guest Customer'}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                {order.user?.email || order.user_email || ''}
                                            </div>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}</td>
                                        <td>
                                            {order.isPaid ? (
                                                <span className="status-badge status-delivered">
                                                    <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                                                    Paid ({order.paymentMethod?.toUpperCase()})
                                                </span>
                                            ) : (
                                                <span className="status-badge status-pending">
                                                    Unpaid ({order.paymentMethod?.toUpperCase() || 'COD'})
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusSelect(order._id, e.target.value)}
                                                className={`admin-status-select status-${order.status}`}
                                                style={{
                                                    padding: '0.35rem 0.65rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    border: '1px solid #d1d5db',
                                                }}
                                            >
                                                {ORDER_STATUS_ACTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <Link to={`/order/${order._id}`} className="btn-icon" title="View Order & Invoice">
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Bar */}
                        {pages > 1 && (
                            <div className="admin-pagination">
                                <span>
                                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} orders
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

export default OrderList;
