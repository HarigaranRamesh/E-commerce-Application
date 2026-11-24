export const globalSetting = {
  name: 'globalSetting',
  title: 'Global Site & Footer Settings',
  type: 'document',
  fields: [
    {
      name: 'site_name',
      title: 'Site Name',
      type: 'string',
      initialValue: 'Clothings Store',
    },
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      initialValue: 'Quality products, Fresh Choices',
    },
    {
      name: 'announcement_banner',
      title: 'Header Announcement Banner',
      type: 'string',
    },
    {
      name: 'about_text',
      title: 'About Brand Text',
      type: 'text',
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      initialValue: '+91 97826260723',
    },
    {
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      initialValue: 'harigaran925@gmail.com',
    },
    {
      name: 'address',
      title: 'Physical Address',
      type: 'string',
      initialValue: 'Kotagiri, Nilgiris, Tamil Nadu, India.',
    },
    {
      name: 'twitter_url',
      title: 'Twitter URL',
      type: 'url',
    },
    {
      name: 'instagram_url',
      title: 'Instagram URL',
      type: 'url',
    },
    {
      name: 'facebook_url',
      title: 'Facebook URL',
      type: 'url',
    },
    {
      name: 'copyright_text',
      title: 'Copyright Text',
      type: 'string',
      initialValue: '© Copyright 2025 Clothings Store. All rights reserved.',
    },
    {
      name: 'free_shipping_threshold',
      title: 'Free Shipping Threshold (₹)',
      type: 'number',
      initialValue: 999,
    },
  ],
};
