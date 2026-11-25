export const banner = {
  name: 'banner',
  title: 'Hero Banner Slide',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Headline / Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'subtitle',
      title: 'Subtitle / Description',
      type: 'string',
    },
    {
      name: 'alt',
      title: 'Image Alt Text',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Banner Image File',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'imageUrl',
      title: 'External Image URL (Fallback)',
      type: 'url',
    },
    {
      name: 'link',
      title: 'Destination URL Link',
      type: 'string',
      initialValue: '/Category',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'badge',
      title: 'Badge Text',
      type: 'string',
      description: 'e.g., SEASON SALE, NEW ARRIVALS, EXCLUSIVE',
    },
    {
      name: 'order',
      title: 'Slide Order',
      type: 'number',
      initialValue: 1,
    },
    {
      name: 'active',
      title: 'Active Slide',
      type: 'boolean',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'link',
      media: 'image',
    },
  },
};
