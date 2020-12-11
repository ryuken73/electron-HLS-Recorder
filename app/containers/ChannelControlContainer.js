import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ChannelControl from '../components/ChannelControl';
import * as appMainAction from '../modules/appMain';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  return {
    ...ownProps,
    savedClips: state.appMain.savedClips
  }
}

function mapDispatchToProps(dispatch) {
  return {AppMainAction: bindActionCreators(appMainAction, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelControl);