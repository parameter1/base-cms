import { a as _extends, c as _objectSpread, b as _objectWithoutProperties, j as _taggedTemplateLiteral } from './chunk-cfc9ba70.js';
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { WebsiteScheduledContent } from '@base-cms/base4-website-nextjs/queries';
import { a as Card } from './chunk-ca546298.js';
import { a as CardBodyStyleA, c as ListGroupStyleA } from './chunk-d660344d.js';
import 'classnames';
import '@base-cms/base4-website-nextjs/components/content';
import '@base-cms/base4-website-nextjs/utils';
import './chunk-24a00436.js';

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment ContentBlockHeroStyleA on PlatformContent {\n    ...ContentListGroupItemStyleA\n    ...ContentCardBodyStyleA\n  }\n  ", "\n  ", "\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}
var fragment = gql(_templateObject(), CardBodyStyleA.fragments.content, ListGroupStyleA.fragments.content);
var propTypes = {
  // @todo These should be placed here by a HOC.
  query: PropTypes.shape({
    after: PropTypes.string,
    children: PropTypes.func,
    excludeContentIds: PropTypes.arrayOf(PropTypes.string),
    excludeContentTypes: PropTypes.arrayOf(PropTypes.string),
    first: PropTypes.number,
    includeContentTypes: PropTypes.arrayOf(PropTypes.string),
    requiresImage: PropTypes.bool,
    sectionBubbling: PropTypes.bool,
    sectionId: PropTypes.number.isRequired
  })
};
var defaultProps = {
  query: {}
};

var BlockHeroA = function BlockHeroA(_ref) {
  var query = _ref.query,
      attrs = _objectWithoutProperties(_ref, ["query"]);

  var props = _objectSpread({}, query, {
    fragment: fragment
  });

  return React.createElement(WebsiteScheduledContent, props, function (_ref2) {
    var loading = _ref2.loading,
        error = _ref2.error,
        items = _ref2.items;
    if (loading) return React.createElement("span", null, "Loading...");

    if (error) {
      return React.createElement("span", null, "Error", ' ', error.message);
    }

    var content = items[0] || {};
    var nodes = items.slice(1) || [];
    return React.createElement("div", {
      className: "row"
    }, React.createElement("div", {
      className: "col-lg-7 col-xl-8"
    }, React.createElement(Card, null, React.createElement(CardBodyStyleA, _extends({
      content: content
    }, attrs)))), React.createElement("div", {
      className: "col-lg-5 col-xl-4"
    }, React.createElement(ListGroupStyleA, _extends({
      nodes: nodes
    }, attrs))));
  });
};

BlockHeroA.displayName = 'WebsiteScheduledContent/Blocks/HeroA';
BlockHeroA.propTypes = propTypes;
BlockHeroA.defaultProps = defaultProps;

var propTypes$1 = {
  // @todo These should be placed here by a HOC.
  query: PropTypes.shape({
    after: PropTypes.string,
    children: PropTypes.func,
    excludeContentIds: PropTypes.arrayOf(PropTypes.string),
    excludeContentTypes: PropTypes.arrayOf(PropTypes.string),
    first: PropTypes.number,
    includeContentTypes: PropTypes.arrayOf(PropTypes.string),
    requiresImage: PropTypes.bool,
    sectionBubbling: PropTypes.bool,
    sectionId: PropTypes.number.isRequired
  })
};
var defaultProps$1 = {
  query: {}
};

var BlockListGroupA = function BlockListGroupA(_ref) {
  var query = _ref.query,
      attrs = _objectWithoutProperties(_ref, ["query"]);

  var fragment = ListGroupStyleA.fragments.content;

  var props = _objectSpread({}, query, {
    fragment: fragment
  });

  return React.createElement(WebsiteScheduledContent, props, function (_ref2) {
    var loading = _ref2.loading,
        error = _ref2.error,
        items = _ref2.items;
    if (loading) return React.createElement("span", null, "Loading...");

    if (error) {
      return React.createElement("span", null, "Error", ' ', error.message);
    }

    return React.createElement(ListGroupStyleA, _extends({
      nodes: items
    }, attrs));
  });
};

BlockListGroupA.displayName = 'WebsiteScheduledContent/Blocks/ListGroupA';
BlockListGroupA.propTypes = propTypes$1;
BlockListGroupA.defaultProps = defaultProps$1;

export { BlockHeroA, BlockListGroupA };
