import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AppMain from '../components/AppMain';
import * as appMainAction from '../modules/appMain';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  return {
    savedClips: state.appMain.savedClips
  }
}

function mapDispatchToProps(dispatch) {
  return {AppMainAction: bindActionCreators(appMainAction, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(AppMain);