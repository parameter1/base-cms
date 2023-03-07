const { Kind } = require('graphql/language');
const { getAsArray } = require('@parameter1/base-cms-object-path');
const getReturnType = require('./get-return-type');

module.exports = function introspect({
  selectionSet,
  returnType,
  schema,
  fragments,
  shallow = false,
}, { parentFieldPath = '', map = new Map() } = {}) {
  const selections = getAsArray(selectionSet, 'selections');
  if (!selections.length) return map;

  const typeObj = getReturnType(returnType);
  const typeObjFieldMap = typeObj.getFields();

  selections.forEach((selection) => {
    if (selection.kind === Kind.FIELD) {
      const { value: fieldName } = selection.name;
      const field = typeObjFieldMap[fieldName];
      if (!field) return; // special fields, such as __typename, will not have a field
      const path = parentFieldPath ? `${parentFieldPath}.${fieldName}` : fieldName;

      if (parentFieldPath) {
        const parent = map.get(parentFieldPath);
        parent.children.add(path);
      }

      if (!map.has(path)) {
        // set...
        map.set(path, {
          field,
          selections: [],
          isRoot: Boolean(!parentFieldPath),
          children: new Set(),
        });
      }
      // then merge...
      const currentSelections = map.get(path).selections;
      // eslint-disable-next-line no-param-reassign
      map.get(path).selections = [
        ...currentSelections,
        ...getAsArray(selection, 'selectionSet.selections'),
      ];

      if (!shallow) {
        introspect({
          selectionSet: selection.selectionSet,
          returnType: field.type,
          schema,
          fragments,
        }, { parentFieldPath: path, map });
      }
    }

    if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = fragments[selection.name.value];

      introspect({
        selectionSet: fragment.selectionSet,
        returnType: schema.getType(fragment.typeCondition.name.value),
        schema,
        fragments,
      }, { parentFieldPath, map });
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      introspect({
        selectionSet: selection.selectionSet,
        returnType: schema.getType(selection.typeCondition.name.value),
        schema,
        fragments,
      }, { parentFieldPath, map });
    }
  });
  return map;
};
