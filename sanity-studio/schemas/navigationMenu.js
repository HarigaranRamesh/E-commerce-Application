export const navigationMenu = {
  name: 'navigationMenu',
  title: 'Navigation Menu Category',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Menu Title',
      type: 'string',
      description: 'e.g. MEN, WOMEN, KIDS',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 1,
    },
    {
      name: 'items',
      title: 'Dropdown Menu Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Link Label', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'link', title: 'Target Route', type: 'string', validation: (Rule) => Rule.required() },
          ],
        },
      ],
    },
  ],
};
