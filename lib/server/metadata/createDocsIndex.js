/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const toSlug = require('../../core/toSlug');

/**
 * some sidebar entries has special syntax. This function reads entry ids and resolves the doc id, they should point to

 * @param  {string|Object} id
 * @param  {Object} allSidebars
 *
 * @return {string} - resolved id
 */
function resolveSidebarItem(id, allSidebars) {
  if (typeof id === 'object') {
    const linkOptions = id;

    if (!linkOptions.href || !linkOptions.label) {
      throw new Error(
        `Bad link format: href and label are required. Received ${JSON.stringify(
          linkOptions
        )}`
      );
    }

    id = linkOptions.id || `link-${toSlug(linkOptions.label)}`;

    return {
      id,
      initialId: id,
      type: 'link',
      prefix: '',
      title: linkOptions.label,
      permalink: linkOptions.href,
    };
  }

  // strip dot notation used to link to docs from other sidebars
  const [mayBeSidebar, ...rest] = id.split('.');
  let resolvedId;
  let prefix = '';

  if (rest.length === 0 || mayBeSidebar.indexOf('version-') === 0) {
    resolvedId = [mayBeSidebar].concat(rest).join('.');
  } else {
    resolvedId = rest.join('.');
    prefix = mayBeSidebar;

    // currently we can not access version info here, so we disabling any validation
    // for versioned sidebars assuming, that they were already validate during version publishing
    if (resolvedId.indexOf('version-') !== 0) {
      if (!allSidebars[mayBeSidebar]) {
        throw new Error(
          `Can not find ${mayBeSidebar} sidebar while resolving ${id}.`
        );
      } else if (
        !Object.keys(allSidebars[mayBeSidebar]).some(category =>
          allSidebars[mayBeSidebar][category].includes(resolvedId)
        )
      ) {
        throw new Error(
          `Can not resolve ${id}, because there is no ${resolvedId} entry in ${mayBeSidebar} sidebar.`
        );
      }
    }
  }

  return {id: resolvedId, prefix, initialId: id};
}

function findSibling(ids, index, increment) {
  while (ids[index + increment]) {
    index += increment;

    if (ids[index].type !== 'link') {
      // we are ignoring 'link' items because this are external links and
      // therefore should not be included in prev/next navigation
      return ids[index].id;
    }
  }

  return undefined;
}

/**
 * Populates an array of sidebars into an index to allow sidebar
 * and sibling docs resolving resolving by doc id
 *
 * @param {Object} allSidebars
 * { [sidebarId: string]: { [categoryName: string]: Array<string> } }
 *
 * @return {Object}
 * { [docId: string]: {
 *   previous: ?string,
 *   next: ?string,
 *   sidebar: string,
 *   category: string
 * } }
 */
function createDocsIndex(allSidebars) {
  const order = {};

  Object.keys(allSidebars).forEach(sidebar => {
    const categories = allSidebars[sidebar];

    let ids = [];
    const categoryOrder = [];

    Object.keys(categories).forEach(category => {
      ids = ids.concat(
        categories[category].map(id => resolveSidebarItem(id, allSidebars))
      );

      for (let i = 0; i < categories[category].length; i++) {
        categoryOrder.push(category);
      }
    });

    for (let i = 0; i < ids.length; i++) {
      const {initialId, ...currentItem} = ids[i];
      const previous = findSibling(ids, i, -1);
      const next = findSibling(ids, i, 1);

      if (order[initialId]) {
        throw new Error(`Sidebar item id "${initialId}" already exists.`);
      }

      order[initialId] = {
        ...currentItem,
        previous,
        next,
        sidebar,
        category: categoryOrder[i],
      };
    }
  });

  return order;
}

module.exports = createDocsIndex;
module.exports.resolveSidebarItem = resolveSidebarItem;
