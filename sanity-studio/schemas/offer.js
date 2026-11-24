export const offer = {
  name: 'offer',
  title: 'Promotional Offer',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Offer Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'code',
      title: 'Coupon Code',
      type: 'string',
    },
    {
      name: 'discount',
      title: 'Discount Text',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'min_spend',
      title: 'Minimum Spend',
      type: 'string',
      initialValue: '₹0',
    },
    {
      name: 'badge',
      title: 'Badge',
      type: 'string',
      initialValue: 'HOT DEAL',
    },
    {
      name: 'cta_text',
      title: 'CTA Text',
      type: 'string',
      initialValue: 'Shop Offer',
    },
    {
      name: 'cta_link',
      title: 'CTA Link',
      type: 'string',
      initialValue: '/Category',
    },
    {
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'is_flash_sale',
      title: 'Is Flash Sale',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 1,
    },
  ],
};
