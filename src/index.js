import React, { Component }   from 'react';
import { connect }            from 'react-redux';
import { bindActionCreators } from 'redux';
import uniqueId from 'lodash/uniqueId';
import extend from 'lodash/extend';

import {
  mapStateToProps,
  pickAllActions,
  fetchKey
} from './utils';

import {
  registerDataConnection,
  updateDataConnect,
  reducer
} from './modules';

export { reducer as dataConnectReducer };

export default ( mapping = {}, additionalActions = {}) => {
  return WrappedComponent => {

    class ReduxDataConnect extends Component {

      constructor(props) {
        super(props);
        this._id     = uniqueId("redux_data_connect_");
        this.actions = pickAllActions(mapping);
        this.fetches = {};
        this.state   = {};
      }

      updateFetchState( key, fetchItem, err ) {
        // const newKey = fetchKey(key);
        const { dispatch }  = this.context.store;
        dispatch(updateDataConnect(this._id, key, {
          isPending:    fetchItem.isPending(),
          isRejected:   fetchItem.isRejected(),
          isFulfilled:  fetchItem.isFulfilled(),
          error:        err
        }));
      }

      componentWillMount() {
        const { dispatch }  = this.context.store;
        dispatch(registerDataConnection(this._id));

        const hocProps      = this.props;
        // fire all actions from mapping
        this.actions.forEach((action) => {
          let result = this.fetches[action.prop] = dispatch(action.fnc.apply(this. hocProps));
          if (result.then) {
            this.updateFetchState(action.prop, result)
            result
              .then(() => {
                this.updateFetchState(action.prop, result);
              }).catch((err) => {
                this.updateFetchState(action.prop, result, err);
              })
          }
        });
      }


      componentWillUnmount() {
        const { dispatch }  = this.context.store;
        dispatch(unregisterDataConnection(this._id));
      }

      render() {
        const { props } = this;
        let mappedProps = {};
        Object.keys(mapping).forEach((propKey) => {

          let connectState = this.props.reduxDataConnect[this._id];

          mappedProps[propKey] = {
            data:     props[propKey],
            request:  (connectState) ? connectState[propKey] : null
          }
        });

        Object.keys(props).forEach((ownProp) => {
          if (!mappedProps.hasOwnProperty(ownProp)) {
            mappedProps[ownProp] = props[ownProp];
          }
        })

        return <WrappedComponent {...mappedProps} />;
      }
    }

    ReduxDataConnect.contextTypes = {
      store: React.PropTypes.object
    };

    return connect(
      (state) => {
        return mapStateToProps(mapping, state)
      }, (dispatch, ownProps) => {
        const actions = pickAllActions(mapping);
        let payload = {};
        actions.forEach((action) => {
          payload[action.name] = action.fnc
        });

        extend(payload, additionalActions);

        return { actions: bindActionCreators(payload, dispatch)};
      }
    )(ReduxDataConnect);
  }
}
