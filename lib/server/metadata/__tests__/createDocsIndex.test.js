/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const createDocsIndex = require('../createDocsIndex');

const {resolveSidebarItem} = createDocsIndex;

it('should populate docs index from multiple sidebars', () => {
  const result = createDocsIndex({
    docs: {
      Category1: ['doc1', 'doc2'],
      Category2: ['doc3', 'doc4'],
    },
    otherDocs: {
      Category1: ['doc5'],
    },
  });

  expect(result).toMatchSnapshot();
});

it('should resolve docs from older versions', () => {
  const result = createDocsIndex({
    docs: {
      Category1: ['doc1'],
    },
    'version-1.2.3-docs': {
      Category1: ['version-1.2.3-doc2'],
      Category2: ['version-1.2.3-doc1'],
    },
  });

  expect(result).toMatchSnapshot();
});

it('should resolve links to other sidebar docs', () => {
  const result = createDocsIndex({
    docs: {
      Category1: ['doc1'],
    },
    docs2: {
      Category2: ['docs.doc1', 'doc2'],
    },
  });

  expect(result).toMatchSnapshot();
});

describe('resolveSidebarItem()', () => {
  const sidebars = {
    docs: {
      foo: ['installation', 'version-1.3.3-installation'],
    },
  };

  test('simple id', () => {
    const result = resolveSidebarItem('installation', sidebars);

    expect(result).toEqual({
      id: 'installation',
      initialId: 'installation',
      prefix: '',
    });
  });

  test('versioned id', () => {
    const result = resolveSidebarItem('version-1.3.3-installation', sidebars);

    expect(result).toEqual({
      id: 'version-1.3.3-installation',
      initialId: 'version-1.3.3-installation',
      prefix: '',
    });
  });

  test('id from different sidebar', () => {
    const result = resolveSidebarItem('docs.installation', sidebars);

    expect(result).toEqual({
      id: 'installation',
      initialId: 'docs.installation',
      prefix: 'docs',
    });
  });

  test('versioned id from different sidebar', () => {
    const result = resolveSidebarItem(
      'docs.version-1.3.3-installation',
      sidebars
    );

    expect(result).toEqual({
      id: 'version-1.3.3-installation',
      initialId: 'docs.version-1.3.3-installation',
      prefix: 'docs',
    });
  });
});
