import alt from 'src/stores/alt/alt';
import GaseousReactionActions from 'src/stores/alt/actions/GaseousReactionActions';

class GasPhaseReactionStore {
  constructor() {
    this.state = {
      gaseousReactionStatus: false,
      catalystReferenceMolValue: null,
      reactionVesselSizeValue: null,
    };

    this.bindListeners({
      handleGasButtonStatusChange: this.handleGasButtonStatusChange,
      gaseousReaction: this.gaseousReaction,
      setCatalystReferenceMole: this.setCatalystReferenceMole,
      setReactionVesselSize: this.setReactionVesselSize,
    });
    this.bindActions(GaseousReactionActions);
  }

  handleGasButtonStatusChange() {
    this.setState({
      gaseousReactionStatus: !this.state.gaseousReactionStatus,
    });
  }

  gaseousReaction(boolean) {
    this.setState({
      gaseousReactionStatus: boolean,
    });
  }

  setCatalystReferenceMole(value) {
    this.setState({
      catalystReferenceMolValue: value,
    });
  }

  setReactionVesselSize(value) {
    this.setState({
      reactionVesselSizeValue: value,
    });
  }
}

export default alt.createStore(GasPhaseReactionStore, 'GasPhaseReactionStore');