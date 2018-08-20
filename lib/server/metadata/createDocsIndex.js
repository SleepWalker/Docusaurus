/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * some sidebar entries has special syntax. This function reads entry ids and resolves the doc id, they should point to

 * @param  {string} id
 * @param  {Object} allSidebars
 *
 * @return {string} - resolved id
 */
function resolveSidebarItem(id, allSidebars) {
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
      const {id, prefix, initialId} = ids[i];
      let previous;
      let next;

      if (i > 0) {
        previous = ids[i - 1].id;
      }

      if (i < ids.length - 1) {
        next = ids[i + 1].id;
      }

      order[initialId] = {
        id,
        prefix,
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
