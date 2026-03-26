'use strict';

module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: 'table-grid',
    plugin: 'table-grid',
    type: 'json',
    inputSize: {
      default: 12,
      isResizable: true,
    },
  });
};
