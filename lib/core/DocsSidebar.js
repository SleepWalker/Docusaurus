/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Container = require('./Container.js');
const SideNav = require('./nav/SideNav.js');
const readCategories = require('../server/readCategories.js');

class DocsSidebar extends React.Component {
  render() {
    const {root, title, metadata} = this.props;
    const {sidebar, language} = metadata;
    const docsCategories = readCategories(sidebar, language);

    const categoryName = docsCategories[0].name;

    if (!categoryName) {
      return null;
    }

    return (
      <Container className="docsNavContainer" id="docsNav" wrapper={false}>
        <SideNav
          language={language}
          root={root}
          title={title}
          contents={docsCategories}
          current={metadata}
        />
      </Container>
    );
  }
}

module.exports = DocsSidebar;
