export const category = {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Category Name',
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
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Category Image',
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
      name: 'count',
      title: 'Styles Count Badge',
      type: 'string',
      description: 'e.g. 40+ Styles, Trending Dresses & Tops',
    },
    {
      name: 'gender',
      title: 'Department / Gender',
      type: 'string',
      options: {
        list: [
          { title: 'All', value: 'all' },
          { title: 'Men', value: 'men' },
          { title: 'Women', value: 'women' },
          { title: 'Kids', value: 'kids' },
        ],
      },
      initialValue: 'all',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 1,
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
};
