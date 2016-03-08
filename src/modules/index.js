import extend from 'lodash/extend';

// CONSTANTS
const REGISTER_DATA_CONNECT   = "REGISTER_DATA_CONNECT";
const UPDATE_DATA_CONNECT     = "UPDATE_DATA_CONNECT";
const UNREGISTER_DATA_CONNECT = "UNREGISTER_DATA_CONNECT";


export const registerDataConnection = ( id ) => {
  return {
    type: REGISTER_DATA_CONNECT,
    payload: {
      id: id
    }
  }
}

export const updateDataConnect = (id, propKey, requestData) => {
  return {
    type: UPDATE_DATA_CONNECT,
    payload: { id, propKey, requestData }
  }
}

export const unregisterDataConnection = (id) => {
  return {
    type: UNREGISTER_DATA_CONNECT,
    payload: { id }
  }
}

// REDUCER
const initialState = {};
export const reducer = ( state = {}, {type, payload}) => {

  switch(type) {
    case REGISTER_DATA_CONNECT:
      let existingState = state[payload.id] || {};
      return extend({}, state, {
        [payload.id]: {}
      })
      break;
    case UPDATE_DATA_CONNECT:
      let stateCopy = extend({}, state);
      stateCopy[payload.id] = stateCopy[payload.id] || {};
      extend(stateCopy[payload.id], {
        [payload.propKey]: payload.requestData
      });
      return stateCopy;
      break;
    case UNREGISTER_DATA_CONNECT:
      let finalStateCopy = extend({}, state);
      delete finalStateCopy[payload.id];
      return finalStateCopy;
      break;
    default:
      return state;
  }

  return state;
};
