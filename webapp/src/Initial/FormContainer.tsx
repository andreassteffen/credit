import InitialForm from './Form';
import { fetchKnockouts, initialLoad } from '../IO/actions';
import { showMessage } from '../Messages/actions';
//import * as actions from '../actions/';
import { connect } from 'react-redux';
// import { push } from 'react-router-redux';

export function mapStateToProps(state: any) {
  return {
    genes: state.io.genes,
    celllines: new Map(state.io.celllines.map((e: string): [string, string] => [e, e]))
  }
}

export function mapDispatchToProps(dispatch: any, ownProps: any) {
  return {
    go: (geneIds: Array<string>, cellline: string) => dispatch(fetchKnockouts(geneIds, cellline)),
    initialLoad: () => dispatch(initialLoad()),
    onMessage: (message: string) => dispatch(showMessage(message))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InitialForm);
