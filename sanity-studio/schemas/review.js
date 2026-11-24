export const review = {
  name: 'review',
  title: 'Customer Review',
  type: 'document',
  fields: [
    {
      name: 'user_name',
      title: 'Customer Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'rating',
      title: 'Rating (1 - 5)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5),
    },
    {
      name: 'comment',
      title: 'Review Comment',
      type: 'text',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'product_id',
      title: 'Product ID or Reference',
      type: 'string',
    },
    {
      name: 'createdAt',
      title: 'Review Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
  ],
};
