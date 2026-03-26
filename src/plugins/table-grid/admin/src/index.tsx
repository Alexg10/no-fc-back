import { GridFour } from '@strapi/icons';

export default {
  register(app: any) {
    app.customFields.register({
      name: 'table-grid',
      pluginId: 'table-grid',
      type: 'json',
      icon: GridFour,
      intlLabel: {
        id: 'table-grid.label',
        defaultMessage: 'Table grid',
      },
      intlDescription: {
        id: 'table-grid.description',
        defaultMessage: 'Grid with configurable columns and rows (stored as JSON)',
      },
      components: {
        Input: async () =>
          import('./components/TableGridInput').then((m) => ({
            default: m.TableGridInput,
          })),
      },
    });
  },
};
