import extend from 'lodash/extend';

export const pickAllActions = (mapping) => {
  let actions = [];
  Object.keys(mapping).forEach((propKey) => {
    let item    = mapping[propKey];
    let action  = item.action;
    if (action) {
      if (!action.hasOwnProperty("name")) {
        throw new Error("Your ReduxDataConnect action is missing a name property. Your actoun must be an object like: {name: \"myActionName\", fnc: myActionFunc}");
      }
      if (!action.hasOwnProperty("fnc")) {
        throw new Error("Your ReduxDataConnect action is missing a fnc property. Your actoun must be an object like: {name: \"myActionName\", fnc: myActionFunc}");
      }

      actions.push(extend({}, action, {
        prop: propKey
      }));
    }
  });

  return actions;
}
