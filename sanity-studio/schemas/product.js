export const product = {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'price',
      title: 'Price (₹)',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    },
    {
      name: 'original_price',
      title: 'Original Price (₹)',
      type: 'number',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Shirts', value: 'shirts' },
          { title: 'Pants', value: 'pants' },
          { title: 'Hoodies', value: 'hoodies' },
          { title: 'T-Shirts', value: 't-shirts' },
          { title: 'Jackets', value: 'jackets' },
          { title: 'Accessories', value: 'accessories' },
          { title: 'Shoes', value: 'shoes' },
          { title: 'Dresses', value: 'dresses' },
          { title: 'Tops', value: 'tops' },
          { title: 'Ethnic', value: 'ethnic' },
          { title: 'Boys', value: 'boys' },
          { title: 'Girls', value: 'girls' },
          { title: 'Men', value: 'men' },
          { title: 'Women', value: 'women' },
          { title: 'Kids', value: 'kids' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'gender',
      title: 'Gender / Department',
      type: 'string',
      options: {
        list: [
          { title: 'Men', value: 'men' },
          { title: 'Women', value: 'women' },
          { title: 'Kids', value: 'kids' },
          { title: 'Unisex', value: 'unisex' },
        ],
      },
      initialValue: 'men',
    },
    {
      name: 'image',
      title: 'Primary Product Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'imageUrl',
      title: 'Fallback / External Image URL',
      type: 'url',
    },
    {
      name: 'images',
      title: 'Gallery Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'stock',
      title: 'Stock Quantity',
      type: 'number',
      initialValue: 10,
    },
    {
      name: 'rating',
      title: 'Rating (1.0 - 5.0)',
      type: 'number',
      initialValue: 4.5,
      validation: (Rule) => Rule.min(1).max(5),
    },
    {
      name: 'num_reviews',
      title: 'Number of Reviews',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
      initialValue: "Clothings Store Luxury",
    },
    {
      name: 'sku',
      title: 'SKU Code',
      type: 'string',
    },
    {
      name: 'specifications',
      title: 'Specifications',
      type: 'text',
      description: 'JSON or bullet points of product material, fit, care instructions',
    },
    {
      name: 'variants',
      title: 'Available Sizes & Options',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
      price: 'price',
    },
    prepare({ title, subtitle, media, price }) {
      return {
        title,
        subtitle: `${subtitle || ''} • ₹${price || 0}`,
        media,
      };
    },
  },
};
