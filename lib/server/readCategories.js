/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Metadata = require('../core/metadata.js');
const {getDocsSidebarIndex} = require('./readMetadata');

/**
 * returns data broken up into categories for a sidebar
 *
 * @param  {Object} metadata - an article to get sidebar for
 *
 * @return {Array<{ name: string, links: Array<Object> }>}
 */
function readCategories({sidebar, language}) {
  const sidebarIndex = getDocsSidebarIndex();

  if (!sidebar) {
    return [];
  }

  // Build a hashmap of article_id -> metadata
  const articles = Object.keys(Metadata).reduce((acc, id) => {
    const metadata = Metadata[id];

    if (metadata.language === language) {
      acc[metadata.localized_id] = metadata;
    }

    return acc;
  }, {});

  let currentCategory = null;

  const categories = Object.keys(sidebarIndex).reduce((acc, key) => {
    const item = sidebarIndex[key];

    if (item.sidebar === sidebar) {
      if (!currentCategory || item.category !== currentCategory.name) {
        if (currentCategory) {
          acc.push(currentCategory);
        }

        currentCategory = {
          name: item.category,
          links: [],
        };
      }

      const article = articles[item.id];

      if (!article) {
        throw new Error(
          `Can not find doc by id ${item.id} for sidebar item ${key}`
        );
      }

      currentCategory.links.push({
        id: article.id,
        localized_id: article.localized_id,
        original_id: article.original_id,
        title: article.title,
        sidebar_label: article.sidebar_label,
        permalink: article.permalink,
      });
    }

    return acc;
  }, []);

  categories.push(currentCategory);

  return categories;
}

module.exports = readCategories;
