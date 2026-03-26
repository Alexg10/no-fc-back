import type { StrapiApp } from '@strapi/strapi/admin';
import { GridFour } from '@strapi/icons';

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    app.customFields.register({
      name: 'table-grid',
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
          import('../plugins/table-grid/admin/src/components/TableGridInput').then(
            (m) => ({
              default: m.TableGridInput,
            })
          ),
      },
    });
  },
  bootstrap() {},
};
