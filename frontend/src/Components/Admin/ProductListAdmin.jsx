import React, { useEffect, useState } from 'react';
import { productsAPI } from '../../services/api';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductListAdmin = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productsAPI.delete(id);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const createProductHandler = async () => {
        // Placeholder for create logic or redirect
        // For this task, we will just assume a redirect to an Edit/Create page
    };

    if (loading) return <div className="loader"></div>;

    return (
        <div>
            <div className="admin-page-header">
                <h2>Products Management</h2>
                <Link to="/admin/product/new" className="btn btn-primary btn-with-icon">
                    <Plus size={18} /> Create Product
                </Link>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Brand</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={product._id}>
                                <td>{index + 100}</td>
                                <td>{product.name}</td>
                                <td>${product.price}</td>
                                <td>{product.category}</td>
                                <td>{product.brand}</td>
                                <td>
                                    <div className="admin-actions">
                                        <Link to={`/admin/product/${product._id}/edit`} className="btn-icon">
                                            <Edit2 size={18} />
                                        </Link>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => deleteHandler(product._id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductListAdmin;
