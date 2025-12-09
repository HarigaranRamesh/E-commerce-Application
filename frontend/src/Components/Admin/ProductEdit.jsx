import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../../services/api';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = id !== undefined && id !== 'new';

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                const { data } = await productsAPI.getById(id);
                setName(data.name);
                setPrice(data.price);
                setImage(data.image);
                setBrand(data.brand);
                setCategory(data.category);
                setCountInStock(data.stock);
                setDescription(data.description);
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const submitHandler = async (e) => {
        e.preventDefault();
        const productData = {
            name,
            price,
            image,
            brand,
            category,
            stock: countInStock,
            description,
        };

        try {
            if (isEditMode) {
                await productsAPI.update(id, productData);
            } else {
                await productsAPI.create(productData);
            }
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    return (
        <div className="admin-form-container">
            <h2 className="mb-4">{isEditMode ? 'Edit Product' : 'Create Product'}</h2>
            <form onSubmit={submitHandler} className="admin-form">
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input
                        type="number"
                        placeholder="Enter price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Image URL</label>
                    <input
                        type="text"
                        placeholder="Enter image URL"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Brand</label>
                    <input
                        type="text"
                        placeholder="Enter brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Category</label>
                    <input
                        type="text"
                        placeholder="Enter category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Count In Stock</label>
                    <input
                        type="number"
                        placeholder="Enter stock count"
                        value={countInStock}
                        onChange={(e) => setCountInStock(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        placeholder="Enter description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-input textarea"
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                    {isEditMode ? 'Update' : 'Create'}
                </button>
            </form>
        </div>
    );
};

export default ProductEdit;
