import React from 'react';
import { FormattedMessage } from 'react-intl';
import StoreList from './views/Store/StoreList';
import StoreUpdate from "./views/Store/StoreUpdate";

export const sidebarLayout = [
  {
    key: 1,
    title: <FormattedMessage id={'stores'} defaultMessage={'Stores'} />,
    icon: 'glyphicons glyphicons-shop',
    entries: [
      {
        key: 1,
        label: <FormattedMessage id='show_list' defaultMessage='Show all' />,
        path: '/stores',
        requiredPermission: 'solotodo.backend_view_store',
        name: 'Stores',
        component: StoreList
      },
      {
        key: 2,
        label: <FormattedMessage id='update' defaultMessage='Update' />,
        path: '/stores/update',
        requiredPermission: 'solotodo.update_store_prices',
        name: 'StoresUpdate',
        component: StoreUpdate
      }
    ]
  }
];

export const routes = sidebarLayout.reduce((ongoing, section) => {
  return ongoing.concat(section.entries);
}, []);
